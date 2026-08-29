import 'dart:io';
import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

/// Compress images before upload (Batch 10).
class ImageCompressionService {
  /// Max edge length and JPEG quality.
  Future<File> compressForUpload(
    String path, {
    int maxSide = 1600,
    int quality = 82,
  }) async {
    final bytes = await File(path).readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) return File(path);

    img.Image out = decoded;
    final maxDim = decoded.width > decoded.height ? decoded.width : decoded.height;
    if (maxDim > maxSide) {
      if (decoded.width >= decoded.height) {
        out = img.copyResize(decoded, width: maxSide);
      } else {
        out = img.copyResize(decoded, height: maxSide);
      }
    }

    final jpg = img.encodeJpg(out, quality: quality);
    final dir = await getTemporaryDirectory();
    final outPath = p.join(
      dir.path,
      'kx_${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
    final file = File(outPath);
    await file.writeAsBytes(Uint8List.fromList(jpg));
    return file;
  }
}
