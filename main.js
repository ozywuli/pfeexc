const Immutable = require('immutable');
const flow = require('lodash/flow');

//==============================================================================
// Error message transformation
//==============================================================================

/**
 * Recursively map over a Collection. Continue mapping until encountering a List whose items consist solely of strings. When this occurs, take the List of strings, concatenate them, and include them in the returned Collection
 * @param {Collection}
 * @returns {Collection}
 */
function transformData(data) {
    return data.map(data => {
        return Immutable.Map.isMap(data) ? transformData(data) : createString(data)
    })
}

/**
 * Return collections that are nonempty and contain data
 * @param {Map} data - An Immutable Map
 * @returns {Map}
 */
function getNonEmptyCollections(data) {
    return data.filter(data => data.length || !data.isEmpty());
}

/**
 * Convert Immutable Collection to a List and flatten it
 * @param {Map} data - An Immutable Map
 * @returns {List}
 */
function flattenCollection(data) {
    return data.toList().flatten();
}

/**
 * Pipes in a List, remove duplicate error items, joins every item into a single concatenated string with each item separated by a period and a space.
 * @param {List} data - An Immutable List
 * @returns {string} - Concatenated error string
 */
function createString(data) {
    return Immutable.Set(data).concat(['']).join('. ').trim();
}

/**
 * Checks if the Collection contains a Map or is itself a Map
 * @param {Collection} data - An Immutable Collection
 * @returns {boolean}
 */
function hasMap(data) {
    return data.includes(Immutable.Map()) || Immutable.Map.isMap(data);
}

/**
 * Check to see if a passed in key matches a key that represents a Collection whose nested structure should be preserved
 * @param {array} keysToKeepnested - Array of keys, each of which represent a Collection whose nested structure should be preserved
 * @param {string} key - A key representing a passed in Collection
 * @returns {boolean}
 */
function keepNested(keysToKeepNested, key) {
    return keysToKeepNested.includes(key);
}

/**
 * Decide whether to map over a Collection or ultimately return a concatenated string representing the details of an error
 * @param {Collection} data - An Immutable Collection
 * @returns {string} - Concatenated error string
 */
function transformCollection(data) {
    return hasMap(data) ? transformData(data) : createString(data);
}

/**
 * Based on `transformCollection` but returns a flat structure, ie, a concatenated string
 * Use Lodash's flow function to pipe data through a series of functions
 * @param {Collection} data - An Immutable Collection
 * @returns {string} - Concatenated error string
 */
let transformCollectionFlat = flow([getNonEmptyCollections, flattenCollection, transformCollection]);

/**
 * Takes in an Immutable Collection of errors and returns a transformed errors Collection
 * @param {errors} - Immutable Collection
 * @param {array} - Array of keys representing Collections whose nested structuree should be preserved
 * @returns {Collection} - Returns transformed errors Collection
 */
function transformErrors(errors, keysToKeepNested) {
    return Immutable.Map(errors).map((data, key) => {
        return keepNested(keysToKeepNested, key) ? transformCollection(data) : transformCollectionFlat(data);
    })
}

// Export
module.exports = transformErrors;