
export const getUUID = function(){
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(10,'0')
}
    