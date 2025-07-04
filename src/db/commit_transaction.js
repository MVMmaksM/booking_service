export default async (instance)=>{
    await instance.raw("COMMIT;");
}