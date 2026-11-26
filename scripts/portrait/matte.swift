// swift matte.swift <in.png> <out-mask.png>   — Vision subject lifting, full-res soft matte
import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("read") }
let handler = VNImageRequestHandler(cgImage: cg, options: [:])

func write(_ ci: CIImage, _ url: URL) {
  let ctx = CIContext()
  let gray = ci.applyingFilter("CIColorControls", parameters: [kCIInputSaturationKey: 0])
  guard let out = ctx.createCGImage(gray, from: CGRect(x: 0, y: 0, width: cg.width, height: cg.height),
                                    format: .L8, colorSpace: CGColorSpaceCreateDeviceGray()) else { fatalError("render") }
  let dst = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dst, out, nil); CGImageDestinationFinalize(dst)
}

// 1) Subject lifting (best hair detail)
let fg = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([fg])
if let r = fg.results?.first {
  let buf = try r.generateScaledMaskForImage(forInstances: r.allInstances, from: handler)
  write(CIImage(cvPixelBuffer: buf), outURL)
  print("foreground instances:", r.allInstances.count, "→", outURL.path)
}
// 2) Person segmentation, accurate (for comparison)
let ps = VNGeneratePersonSegmentationRequest()
ps.qualityLevel = .accurate
ps.outputPixelFormat = kCVPixelFormatType_OneComponent8
try handler.perform([ps])
if let m = ps.results?.first?.pixelBuffer {
  var ci = CIImage(cvPixelBuffer: m)
  ci = ci.transformed(by: CGAffineTransform(scaleX: CGFloat(cg.width) / ci.extent.width, y: CGFloat(cg.height) / ci.extent.height))
  let url2 = outURL.deletingPathExtension().appendingPathExtension("person.png")
  write(ci, url2); print("person seg →", url2.path)
}
