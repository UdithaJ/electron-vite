import {app, BrowserWindow, ipcMain, shell} from 'electron'
import {release} from 'node:os'
import {join} from 'node:path'

require('../../connection');
const OperationModel = require('../../models/Operation');
const WorkerModel = require('../../models/Worker');
const StyleModel = require('../../models/Style');
const OperationGroupModel = require('../../models/OperationGroup');
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── router.js    > Electron-Main
// │ └─┬ preload
// │   └── router.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/router.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        title: 'Main window',
        icon: join(process.env.PUBLIC, 'favicon.ico'),
        autoHideMenuBar: true,
        width: 1000,
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(url)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    } else {
        win.loadFile(indexHtml)
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${url}#${arg}`)
    } else {
        childWindow.loadFile(indexHtml, {hash: arg})
    }
})

ipcMain.handle('get_styles', async (event, payload) => {
    const res = await StyleModel.find().populate('operations');

    let styles = await StyleModel.aggregate([{
        $lookup: {
            from: "operationgroups",
            localField: "_id",
            foreignField: "styleId",
            as: "operations"
        }
    }]);


    for await (const style of styles) {
        style.styleOp = [];
        let operationGroups = style.operations;
        for await (const operationGroup of operationGroups) {
            operationGroup.opData = [];
            for await (let operation of operationGroup.operations) {
                let opData = await OperationModel.findById(operation);
                style.styleOp.push(opData);
                operationGroup.opData.push(opData);
            }
        }
    }

    return JSON.stringify(styles);
});

ipcMain.handle('get_line', async (event, payload) => {

    //console.log(payload)

    let line = [];
    let styleInfo = JSON.parse(payload);
    let operationGroups = styleInfo.operations;
    let workers = await WorkerModel.aggregate([{
        $lookup: {
            from: "workerskills",
            localField: "_id",
            foreignField: "workerId",
            as: "skills"
        }
    }]);

    for await (const worker of workers) {
        let skills = worker.skills;
        for await (const skill of skills) {
            const skillData = await OperationModel.findById(skill.skillId);
            skill.name = skillData.name;
        }
    }
    let availableWorkers = [];
    let assignedWorkers = [];

    for (const worker of workers) {
        let workerSkills = worker.skills;
        for (const opGroup of operationGroups) {

            let groupSkillVal = 0;
            for await (const operation of opGroup.opData) {
                let skill = workerSkills.find((skill) => {
                    return skill.skillId == operation._id;
                });

                if (skill) {
                  let skillVal = (skill.level / operation.priority) * 100;
                  if(skillVal > 100){
                    skillVal = 100;
                  }
                    groupSkillVal = groupSkillVal + skillVal;
                    //
                    // let lineWorker = {
                    //     group: opGroup.group,
                    //     value: groupSkillVal,
                    //     assignee: worker
                    // }
                    //
                    // availableWorkers.push(lineWorker);
                } else {
                    groupSkillVal = 0;
                    break;
                }
            }

            if(groupSkillVal > 0){
              let lineWorker = {
                group: opGroup.group,
                value: groupSkillVal / opGroup.opData.length,
                assignee: worker
              }

              availableWorkers.push(lineWorker);
            }

        }
    }

  //console.log(" Group: ", availableWorkers);
    for (const opGroup of operationGroups) {
        let workers = availableWorkers.filter((worker) => {
            return worker.group === opGroup.group;
        })
        if (workers.length) {
            let maxValue = Math.max(...workers.map(worker => worker.value));
            let groupAssignee = workers.find(worker => worker.value === maxValue);
            if (groupAssignee) {
                let lineMember = {
                    group: opGroup,
                    assignee: groupAssignee
                }

                line.push(lineMember);
                assignedWorkers.push(groupAssignee);
                availableWorkers = availableWorkers.filter(function (worker) {
                    return worker.assignee._id !== groupAssignee.assignee._id;
                });
            } else {
                let workersToReplace = assignedWorkers.filter((worker) => {
                    return worker.group === opGroup.group;
                })
                if (workersToReplace.length) {
                    let maxValue = Math.max(...workersToReplace.map(worker => worker.value));
                    let workerFromAssignees = workersToReplace.find(worker => worker.value === maxValue);

                    if (workerFromAssignees) {
                        let workers = availableWorkers.filter((worker) => {
                            return worker.group === workerFromAssignees.group;
                        });

                        if (workers.length) {
                            let maxValue = Math.max(...workers.map(worker => worker.value));
                            let groupAssignee = workers.find(worker => worker.value === maxValue);
                            if (groupAssignee) {
                                let lineMember = {
                                    group: workerFromAssignees.group,
                                    assignee: groupAssignee
                                }
                                line.push(lineMember);

                                let lineMember2 = {
                                    group: opGroup,
                                    assignee: workerFromAssignees
                                }
                                line.push(lineMember2);

                                availableWorkers = availableWorkers.filter(function (worker) {
                                    return worker.assignee._id !== groupAssignee.assignee._id;
                                });
                            }
                        } else {
                            //find from assigned members
                            let assignedWorkersToReplace = assignedWorkers.filter((worker) => {
                                return worker.group === workerFromAssignees.group && worker.assignee._id !== workerFromAssignees.assignee._id;
                            });

                            if (assignedWorkersToReplace.length) {
                                let maxValue = Math.max(...assignedWorkersToReplace.map(worker => worker.value));
                                let groupAssignee = assignedWorkersToReplace.find(worker => worker.value === maxValue);

                                if (groupAssignee) {

                                    let workers = availableWorkers.filter((worker) => {
                                        return worker.group === groupAssignee.group;
                                    });

                                    if (workers.length) {
                                        let maxValue = Math.max(...workers.map(worker => worker.value));
                                        let groupAssignee2 = workers.find(worker => worker.value === maxValue);

                                        let lineMember = {
                                            group: groupAssignee2.group,
                                            assignee: groupAssignee2
                                        }
                                        let lineMember2 = {
                                            group: opGroup,
                                            assignee: groupAssignee
                                        }
                                        line.push(lineMember);
                                        line.push(lineMember2);
                                    }

                                }
                            }

                        }

                    }
                }
            }
        } else {
            //no resources
        }
        //console.log("Assignee: ", groupAssignee);
    }
    console.log("Line: ", line);

    return JSON.stringify(line);
});

ipcMain.handle('get_workers', async (event, payload) => {
    const res = await WorkerModel.find();
    let all = await WorkerModel.aggregate([{
        $lookup: {
            from: "workerskills",
            localField: "_id",
            foreignField: "workerId",
            as: "skills"
        }
    }]);

    for await (const worker of all) {
        let skills = worker.skills;
        for await (const skill of skills) {
            const skillData = await OperationModel.findById(skill.skillId);
            skill.name = skillData.name;
            //console.log("description ", all[0].skills);
        }
    }
    return JSON.stringify(all);
});