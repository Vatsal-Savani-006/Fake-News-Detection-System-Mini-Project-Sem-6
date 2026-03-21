const sessonIdtoUserMap=new Map();


function setUser(id,user){
     sessonIdtoUserMap.set(id,user);
}


function getUser(id){
  return sessonIdtoUserMap.get(id);
}

function deleteUser(id) {           
    sessonIdtoUserMap.delete(id);
}

module.exports ={
    setUser,
    getUser,
    deleteUser,
}