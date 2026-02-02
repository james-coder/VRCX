const { watchState } = require('../watchState');

const mockRequest = jest.fn(() =>
    Promise.resolve({
        ok: true,
        token: 'token'
    })
);

jest.mock('../request', () => ({
    request: (...args) => mockRequest(...args)
}));

jest.mock('worker-timers', () => ({
    setTimeout: jest.fn()
}));

jest.mock('noty', () => {
    return function Noty() {
        return {
            show() {
                return this;
            },
            close() {}
        };
    };
});

jest.mock('../../shared/utils', () => ({
    escapeTag: (value) => String(value),
    parseLocation: () => ({
        worldId: '',
        instanceId: ''
    })
}));

jest.mock('../../stores', () => ({
    useFriendStore: () => ({
        handleFriendAdd: jest.fn(),
        handleFriendDelete: jest.fn(),
        updateFriend: jest.fn()
    }),
    useGalleryStore: () => ({
        galleryDialogVisible: false,
        galleryDialogIconsLoading: false,
        galleryDialogGalleryLoading: false,
        galleryDialogEmojisLoading: false,
        galleryDialogPrintsLoading: false,
        galleryDialogInventoryLoading: false,
        refreshVRCPlusIconsTable: jest.fn(),
        refreshGalleryTable: jest.fn(),
        refreshEmojiTable: jest.fn(),
        refreshPrintTable: jest.fn(),
        getInventory: jest.fn(),
        tryDeleteOldPrints: jest.fn()
    }),
    useGroupStore: () => ({
        onGroupLeft: jest.fn(),
        handleGroupUserInstances: jest.fn(),
        handleGroupMember: jest.fn(),
        getGroupDialogGroup: jest.fn(),
        groupDialog: { visible: false, id: null }
    }),
    useInstanceStore: () => ({
        instanceQueueUpdate: jest.fn(),
        instanceQueueReady: jest.fn(),
        removeQueuedInstance: jest.fn()
    }),
    useLocationStore: () => ({
        setCurrentUserLocation: jest.fn(),
        lastLocation: { friendList: new Map(), location: '' }
    }),
    useNotificationStore: () => ({
        handleNotification: jest.fn(),
        handlePipelineNotification: jest.fn(),
        handleNotificationV2: jest.fn(),
        handleNotificationHide: jest.fn(),
        handleNotificationSee: jest.fn(),
        handleNotificationV2Update: jest.fn(),
        queueNotificationNoty: jest.fn(),
        notificationTable: { filters: [{ value: [] }], data: [] }
    }),
    useSharedFeedStore: () => ({
        addEntry: jest.fn()
    }),
    useUiStore: () => ({
        notifyMenu: jest.fn()
    }),
    useUserStore: () => ({
        cachedUsers: new Map(),
        applyUser: jest.fn(),
        applyCurrentUser: jest.fn(),
        currentUser: { id: 'user' }
    })
}));

jest.mock('../../api', () => ({
    groupRequest: {
        getGroup: jest.fn(() => Promise.resolve({ json: {} }))
    }
}));

describe('WebSocket service', () => {
    let lastSocket = null;

    beforeEach(() => {
        lastSocket = null;
        watchState.isFriendsLoaded = true;
        watchState.isLoggedIn = true;
        mockRequest.mockClear();

        global.WebSocket = class MockWebSocket {
            constructor(url) {
                this.url = url;
                this.close = jest.fn();
                lastSocket = this;
            }
        };
    });

    test('onerror closes the socket without invoking onclose directly', async () => {
        const { initWebsocket, closeWebSocket } = require('../websocket');
        await initWebsocket();

        const socket = lastSocket;
        socket.onclose = jest.fn();
        socket.onerror();

        expect(socket.close).toHaveBeenCalledTimes(1);
        expect(socket.onclose).not.toHaveBeenCalled();

        closeWebSocket();
    });

    test('ignores malformed JSON messages without logging pipeline errors', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const { initWebsocket, closeWebSocket } = require('../websocket');
        await initWebsocket();

        const socket = lastSocket;
        socket.onmessage({ data: '{not-json' });

        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        closeWebSocket();
    });
});
