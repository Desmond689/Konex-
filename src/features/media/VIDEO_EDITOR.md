# Video editor (50 MB gate)

- ≤ 50 MB → upload path
- > 50 MB → VideoEditorModal (user must trim; no auto-cut)
- Continue enabled only after processVideoForUpload measures output ≤ 50 MB
- Requires development build with react-native-compressor for real re-encode
