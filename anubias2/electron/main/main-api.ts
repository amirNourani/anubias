import {ipcMain, shell, BrowserWindow, Menu} from 'electron';
import {AppMenu} from './app-menu';

const Store = require('electron-store');
const store: any = new Store();
let win: any = null;
let menuapp: any = null;
let lastProject: string = '';
// api receive by main

ipcMain.on('close', (_event, ...args) => {
    console.log('close', args);
});

ipcMain.on('open-website', async (_event, ...args) => {
    await shell.openExternal(args[0]);
});

ipcMain.handle('electron-store-get-data', (event, key) => {
    return store.get(key);
});

//
ipcMain.on("app-started", (event, args) => {
    win = BrowserWindow.getFocusedWindow();

    menuapp = new AppMenu(win);
    let menu = Menu.buildFromTemplate(menuapp.menu());
    Menu.setApplicationMenu(menu);
});

/**
 * set has project for menu build
 */
ipcMain.on("set-has-project", (event, ...args) => {
    menuapp.setHasProject(args[0]);
    let menu = Menu.buildFromTemplate(menuapp.menu());
    Menu.setApplicationMenu(menu);
});

/**
 * update menu states like has project
 */
ipcMain.on("set-menu-state", (event, ...args) => {
    menuapp.setMenuState(args[0], args[2]);
    let menu = Menu.buildFromTemplate(menuapp.menu());
    Menu.setApplicationMenu(menu);
});

/**
 * update store data main side
 * need for back-end actions
 */
ipcMain.on('update-store-data', async (event, args) => {
    win.vuexStore = JSON.parse(args);
    menuapp.setMenuStore(JSON.parse(args));

    if (lastProject !== JSON.stringify(win.vuexStore.project)) {
        lastProject = JSON.stringify(win.vuexStore.project);
        // if (win.vuexStore.project.projectFile != ''){
        //     menuapp.setMenuState('canSave',true);
        //     let menu = Menu.buildFromTemplate(menuapp.menu());
        //     Menu.setApplicationMenu(menu);
        // }
        for (const k in win.vuexStore.ide.menu) {
            menuapp.setMenuState(k, win.vuexStore.ide.menu);
        }
        let menu = Menu.buildFromTemplate(menuapp.menu());
        Menu.setApplicationMenu(menu);
    }
})

ipcMain.handle('run-menu-event', async (event, menuItemLabel) => {
    const menu = Menu.getApplicationMenu();
    let menuItem = null;

    // Find the menu item by its label
    menu.items.forEach(item => {
        if (item.label === menuItemLabel) {
            menuItem = item;
        } else if (item.submenu) {
            item.submenu.items.forEach(subItem => {
                if (subItem.label === menuItemLabel) {
                    menuItem = subItem;
                }
            });
        }
    });

    // If the menu item exists, trigger its click event
    if (menuItem) {
        await menuItem.click();
        return true;
    } else {
        return false;
    }
});



