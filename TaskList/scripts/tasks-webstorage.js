storageEngine = function() {
    /* Private closure environment */
    var initialized = false;
    var initializedObjectStore = {};

    function getStorageObject(type) {
        var item = localStorage.getItem(type);
        var parsedItem = JSON.parse(item);
        return parsedItem;
    }

    /* Returns a singleton object */
    return {
        init: function(successCallback, errorCallback) {
            if (window.localStorage) {
                initialized = true;
                successCallback(null);
            }
            else {
                errorCallback('storage_api_not_supported', 'The web storage api is not supported');
            }
        },
        initObjectStore: function(type, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!localStorage.getItem(type)) { // no store for specified type
                localStorage.setItem(type, JSON.stringify({}));
                initializedObjectStore[type] = true;
                successCallback(null);
            }
            else if (localStorage.getItem(type)) { // existing store for specified type found
                initializedObjectStore[type] = true;
                successCallback(null);
            }
        },
        save: function(type, obj, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialized', 'The object store ' + type + ' has not been initialized');
            }
            else {
                if (!obj.id) {
                    obj.id = $.now();
                }
                var storageItem = getStorageObject(type);
                storageItem[obj.id] = obj;
                localStorage.setItem(type, JSON.stringify(storageItem));
                successCallback(obj);
            }
        },
        saveAll: function(type, objArray, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialised', 'The storage engine has not been initialised');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialised', '1. The object store ' + type + ' has not been initialised');
            }
            else {
                var storageItem = getStorageObject(type);
                $.each(objArray, function(i, obj) {
                    if(!obj.id) {
                        obj.id = $.now();
                    }
                    storageItem[obj.id] = obj;
                    localStorage.setItem(type, JSON.stringify(storageItem));
                });
                successCallback(objArray);
            }
        },
        findAll: function (type, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialized', '2. The object store ' + type + ' has not been initialized');
            }
            else {
                var result = [];
                var storageItem = getStorageObject(type);
                $.each(storageItem, function(i, v) {
                    result.push(v);
                });
                successCallback(result);
            }
        },
        delete: function(type, id, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialized', '2. The object store ' + type + ' has not been initialized');
            }
            else {
                var storageItem = getStorageObject(type);
                if (storageItem[id]) {
                    delete storageItem[id];
                    localStorage.setItem(type, JSON.stringify(storageItem));
                    successCallback(id);
                }
                else {
                    errorCallback('object_not_found', 'The object to be deleted could not be found');
                }
            }
        },
        findByProperty: function(type, propertyName, propertyValue, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialized', '2. The object store ' + type + ' has not been initialized');
            }
            else {
                var result = [];
                var storageItem = getStorageObject(type);
                $.each(storageItem, function(i, v) {
                    if (v[propertyName] === propertyValue) {
                        result.push(v);
                    }
                });
                successCallback(result);
            }
        },
        findById: function(type, id, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            else if (!initializedObjectStore[type]) {
                errorCallback('store_not_initialized', '2. The object store ' + type + ' has not been initialized');
            }
            else {
                var storageItem = getStorageObject(type);
                var result = storageItem[id];
                if (!result) {
                    result = null;
                }
                successCallback(result);
            }
        }
    };
}();