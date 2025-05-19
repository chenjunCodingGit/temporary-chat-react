import OmnichannelChatSDK from '@microsoft/omnichannel-chat-sdk';

const omnichannelConfig = {
    orgUrl: "",
    orgId: "",
    widgetId: ""
};

const chatSDKConfig = { // Optional
    dataMasking: {
        disable: false,
        maskingCharacter: '#'
    }
};

const chatSDK = new OmnichannelChatSDK.OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);

const optionalParams = {
    getLiveChatConfigOptionalParams: {
        sendCacheHeaders: false // Whether to send Cache-Control HTTP header to GetChatConfig call
    }
};

await chatSDK.initialize(optionalParams);