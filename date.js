exports.getDate = ()=>{
  let today = new Date();
  let options = {
    weekday: "long",
    year: "2-digit",
    month: "long",
    day: "numeric",
  };
  return today.toLocaleDateString("en-IN", options);
}


exports.getDay = ()=>{
    let today = new Date();
    let options = {
      weekday: "long"
    };
    return today.toLocaleDateString("en-IN", options);
  }
  