const sessonIdtoUserMap=new Map();

function setUser(id,user){
     sessonIdtoUserMap.set(id,user);
}
function getUser(id){
  return sessonIdtoUserMap.get(id);
}
module.exports ={
    setUser,
    getUser,
}