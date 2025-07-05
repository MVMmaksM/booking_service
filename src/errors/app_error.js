export default class AppError extends Error{
    status_code;        
    details;

    constructor(status_code, details){
        super();
        this.status_code = status_code;        
        this.details = details;
    }
}