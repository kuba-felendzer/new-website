exports.getFileNameFromPath = function(path) {
    return path.split("/")[path.split("/").length-1]
}