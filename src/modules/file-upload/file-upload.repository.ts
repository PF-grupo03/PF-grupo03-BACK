// import { Injectable } from "@nestjs/common";
// import { UploadApiResponse, v2 } from "cloudinary";
// import toStream = require('buffer-to-stream');

// @Injectable()
// export class FileUploadRepository {
//   async uploadImage(
//     file: Express.Multer.File
// ): Promise<UploadApiResponse> {
//     return new Promise((resolve, reject) => {
//       const upload = v2.uploader.upload_stream(
//         { resource_type: 'auto', folder: 'travel_zone_cloudinary' },
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         },
//       );
//       toStream(file.buffer).pipe(upload);
//     });
//   }
// }

import { Injectable } from "@nestjs/common";
import { UploadApiResponse, v2 } from "cloudinary";
import toStream = require('buffer-to-stream');

@Injectable()
export class FileUploadRepository {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto', folder: 'travel_zone_cloudinary' },
        (error, result) => {
          if (error) {
            console.error('Error al subir imagen a Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}

