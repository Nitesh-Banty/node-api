interface IApiResponse<T=any>{
    statusCode:number,
    data:T;
    message:string;
    success:boolean;
}

class ApiResponse<T=any> implements IApiResponse<T>  {
    constructor(
        public statusCode: number,
        public data: T,
        public message: string,
        public success: boolean
    ) {  }

    static success<T>(data:T,message:string="success",statusCode:number=200,success:boolean=true):ApiResponse<T>{
       return new ApiResponse(statusCode,data,message,success)
    }

    static error<T = null>(message: string, statusCode: number = 400, data: T ): ApiResponse<T> {
        return new ApiResponse(statusCode, data, message, false);
    }
}