declare module 'cloudinary' {
    export namespace v2 {
      interface ConfigOptions {
        cloud_name: string;
        api_key: string;
        api_secret: string;
        secure?: boolean;
      }
  
      namespace uploader {
        function upload(
          file: string,
          options: {
            public_id?: string;
            folder?: string;
            resource_type?: string;
          },
          callback: (error: any, result: any) => void
        ): void;
      }
  
      function config(options: ConfigOptions): void;
    }
  }