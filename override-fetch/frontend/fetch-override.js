const __legacyFetch = window.fetch;
let __openFetchPromises = 0;
let __waitForFetchPromise = Promise.resolve();
let __waitForFetchResolve = null;

// need a function to instrument promise-ified methods from fetch down
function __instrumentPromise(legacyThis, legacyFct, legacyFctName) {
    return function() {
        if (__openFetchPromises === 0) {
            __waitForFetchPromise = new Promise(resolve => __waitForFetchResolve = resolve);
        }
        const legacyRes = legacyFct.apply(legacyThis, arguments);
        if (legacyRes instanceof Promise) {
            __openFetchPromises++;
            console.log('New ' + legacyFctName + ' - now: ' + __openFetchPromises);
            return legacyRes.then((legacyPromiseRes) => {
                // if there's a chance for new promises, instrument accordingly
                Object.keys(legacyPromiseRes?.__proto__ || {})
                    .filter(name => typeof(legacyPromiseRes[name]) === 'function')
                    .forEach(name => {
                        legacyPromiseRes[name] = __instrumentPromise(legacyPromiseRes, legacyPromiseRes[name], name);
                    });
                // handle this result itself
                setTimeout(() => { // run ALL other handlers before declaring we're done
                    __openFetchPromises--;
                    console.log('Done handling ' + legacyFctName + ' - now: ' + __openFetchPromises);
                    if (__openFetchPromises === 0) {
                        console.log('Done with backend - firing our promise');
                        __waitForFetchResolve();
                    }
                });
                return legacyPromiseRes;
            });
        } else {
            return legacyRes;
        }
    };
}

window.__waitForFetch = async function() {
    await __waitForFetchPromise;
};
window.__hasOngoingFetch = function() {
    return __openFetchPromises === 0;
};

// finally insert our hook
window.fetch = __instrumentPromise(window, window.fetch, 'fetch');
