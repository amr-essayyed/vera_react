export const odooDatetimeFormat = (jsDatetime: string) => {
    console.log("jsDatetime");
    console.log(jsDatetime);
    
    const result =  new Date(jsDatetime).toISOString().slice(0, 19).replace('T', ' ');
    console.log("result");
    console.log(result);
    return result;
}