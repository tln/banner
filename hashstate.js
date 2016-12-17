// Including this file will:
// 1. get location hash, turn into Object
// 2. call onHashStateInit()
// 3. enable editing protocol (see below)
// 3. export updateHashState()

// enable editing protocol:
// 1. send message to parent with data {message:'widget-edit-enabled'}
// 2. listen for message from parent with {message:'enable-widget-edit'}
// 3. send messages to parent with {message:'widget-edited',url:...}
// 
// This implementation doesn't handle editing

var updateHashState = (function () {
    'use strict';
    var postUrlChanges;

    function updateHashState(state) {
        window.location.hash = btoa(JSON.stringify(state));
        if (postUrlChanges) {
            window.parent.postMessage({
                message: 'widget-edited',
                url: window.location+''
            }, '*');
        }
    }

    function isTopWindow() {
        try {
            return window.parent === window;
        } catch(e) {
            // If we get an access violation, we can't be top window.
            return false;
        }
    }

    function getState() {
        var hash = window.location.hash.replace(/^#/, '');
        var state = {};
        if (hash) {
            try {
                state = JSON.parse(atob(hash));
            } catch(e) {
                console.log(e);
            }
        }
        return state;
    }

    function callInit(state) {
        try {
            onHashStateInit(state);
        } catch(e) {
            console.log(e);
        }
    }

    function startEditing() {
        // no-op
    }

    function initFrameProtocol() {
        if (isTopWindow()) return;
        window.addEventListener('message', function (event) {
            console.log("message", event.data);
            if (event.data.message === 'enable-widget-edit') {
                postUrlChanges = true;
                startEditing();
            }
        });
        window.parent.postMessage({message:'widget-edit-enabled'}, '*');
    }


    initFrameProtocol();
    callInit(getState());
    return updateHashState;
})();
