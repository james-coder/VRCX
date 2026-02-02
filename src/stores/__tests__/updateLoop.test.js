const { createPinia, setActivePinia } = require('pinia');
const { watchState } = require('../../service/watchState');
const { setTimeout: workerSetTimeout } = require('worker-timers');

const mockGetCurrentUser = jest.fn();
const mockUpdateStoredUser = jest.fn();
const mockRefreshFriendsList = jest.fn();
const mockUpdateAutoStateChange = jest.fn();
const mockUpdateDiscord = jest.fn();

jest.mock('../auth', () => ({
    useAuthStore: () => ({
        updateStoredUser: mockUpdateStoredUser
    })
}));

jest.mock('../user', () => ({
    useUserStore: () => ({
        currentUser: { last_activity: null },
        getCurrentUser: mockGetCurrentUser,
        updateAutoStateChange: mockUpdateAutoStateChange
    })
}));

jest.mock('../friend', () => ({
    useFriendStore: () => ({
        refreshFriendsList: mockRefreshFriendsList,
        isRefreshFriendsLoading: false
    })
}));

jest.mock('../game', () => ({
    useGameStore: () => ({
        updateIsGameRunning: jest.fn()
    })
}));

jest.mock('../moderation', () => ({
    useModerationStore: () => ({
        refreshPlayerModerations: jest.fn()
    })
}));

jest.mock('../vrcx', () => ({
    useVrcxStore: () => ({
        ipcEnabled: true,
        clearVRCXCacheFrequency: 0,
        clearVRCXCache: jest.fn(),
        tryAutoBackupVrcRegistry: jest.fn()
    })
}));

jest.mock('../settings/discordPresence', () => ({
    useDiscordPresenceSettingsStore: () => ({
        discordActive: false,
        updateDiscord: mockUpdateDiscord
    })
}));

jest.mock('../gameLog', () => ({
    useGameLogStore: () => ({
        addGameLogEvent: jest.fn()
    })
}));

jest.mock('../vrcxUpdater', () => ({
    useVRCXUpdaterStore: () => ({
        autoUpdateVRCX: 'Off',
        checkForVRCXUpdate: jest.fn()
    })
}));

jest.mock('../group', () => ({
    useGroupStore: () => ({
        handleGroupUserInstances: jest.fn()
    })
}));

jest.mock('../vr', () => ({
    useVrStore: () => ({
        vrInit: jest.fn()
    })
}));

jest.mock('../../api', () => ({
    groupRequest: {
        getUsersGroupInstances: jest.fn(() => Promise.resolve({ json: {} }))
    }
}));

jest.mock('../../service/database', () => ({
    database: {
        optimize: jest.fn()
    }
}));

jest.mock('worker-timers', () => ({
    setTimeout: jest.fn()
}));

describe('Update loop store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        watchState.isLoggedIn = true;
        watchState.isFriendsLoaded = false;
        global.LINUX = false;
        global.AppApi = {
            CheckGameRunning: jest.fn(),
            IsGameRunning: jest.fn(),
            IsSteamVRRunning: jest.fn()
        };
        mockGetCurrentUser.mockClear();
        workerSetTimeout.mockClear();
    });

    test('external timer writes drive update loop behavior', async () => {
        const { useUpdateLoopStore } = require('../updateLoop');
        const updateLoopStore = useUpdateLoopStore();

        updateLoopStore.nextCurrentUserRefresh = 1;
        updateLoopStore.nextGroupInstanceRefresh = 5;
        updateLoopStore.nextDiscordUpdate = 5;

        await updateLoopStore.updateLoop();

        expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
        expect(updateLoopStore.nextCurrentUserRefresh).toBe(300);
        expect(global.AppApi.CheckGameRunning).not.toHaveBeenCalled();
        expect(workerSetTimeout).toHaveBeenCalled();
    });
});
