import 'dart:io';
import 'package:flutter/foundation.dart'; // Để check kIsWeb
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart' as path_provider;
import 'package:path/path.dart' as p;

class ImageHelper {
  static Future<XFile?> compressImage(XFile file) async {
    if (kIsWeb) {
      return file; 
    }

    try {
      final  dir = await path_provider.getTemporaryDirectory();
      final targetPath = p.join(dir.path, "${DateTime.now().millisecondsSinceEpoch}.jpg");
      final result = await FlutterImageCompress.compressAndGetFile(
        file.path,
        targetPath,
        minWidth: 1080,
        minHeight: 1080,
        quality: 70, 
        rotate: 0, 
      );

      return result;
    } catch (e) {
      print("Lỗi nén ảnh: $e");
      return file;
    }
  }
}