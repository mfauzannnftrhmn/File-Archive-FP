import { Injectable } from '@angular/core';

declare let cordova: any;

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  getVersionNumber(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (cordova && cordova.getAppVersion) {
        cordova.getAppVersion.getVersionNumber(
          (version: string) => resolve(version),
          (error: any) => reject(error)
        );
      } else {
        reject('cordova.getAppVersion tidak tersedia');
      }
    });
  }
}
