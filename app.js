document.getElementById('fileInput').addEventListener('change', (event) => {
  const files = event.target.files; // 複数のファイルを取得

  if (files.length === 0) {
    alert("Please select at least one image file.");
    return;
  }

  // 圧縮率選択ボタンを表示
  const compressionOptions = document.getElementById('compressionOptions');
  compressionOptions.style.display = 'block';

  // 圧縮率ボタンのクリックイベントを設定
  compressionOptions.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const quality = parseFloat(e.target.getAttribute('data-quality')); // 圧縮率を取得
      handleFiles(files, quality); // ファイル処理を実行
    }
  });
});

// ファイルを処理する関数
function handleFiles(files, quality) {
  const downloadLinks = document.getElementById('downloadLinks');
  downloadLinks.innerHTML = ''; // 既存のリンクをクリア

  if (files.length === 1) {
    // 1枚の場合は通常のダウンロードリンクを生成
    handleSingleFile(files[0], quality, downloadLinks);
  } else {
    // 2枚以上の場合はZIPファイルを生成
    handleMultipleFiles(files, quality, downloadLinks);
  }
}

// 1枚のファイルを処理する関数
function handleSingleFile(file, quality, downloadLinks) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');

      // 圧縮後の画像サイズを設定
      canvas.width = img.width / 2;
      canvas.height = img.height / 2;

      // 画像をキャンバスに描画
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 圧縮画像をJPEG形式で取得
      const compressedImage = canvas.toDataURL('image/jpeg', quality);

      // ファイル名を生成
      const originalName = file.name.split('.').slice(0, -1).join('.');
      const extension = file.name.split('.').pop();
      const qualityPercentage = Math.round(quality * 100);
      const newFileName = `${originalName}_compressed_${qualityPercentage}%.${extension}`;

      // ダウンロードリンクを生成
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = newFileName;
      link.textContent = `Download ${newFileName}`;
      link.style.display = 'block';

      // リンクをリストに追加
      const listItem = document.createElement('li');
      listItem.appendChild(link);
      downloadLinks.appendChild(listItem);
    };
  };

  reader.readAsDataURL(file);
}

// 複数ファイルを処理してZIPファイルを生成する関数
function handleMultipleFiles(files, quality, downloadLinks) {
  const zip = new JSZip(); // ZIPファイル作成用オブジェクト
  let processedCount = 0; // 処理済みファイル数

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        // 圧縮後の画像サイズを設定
        canvas.width = img.width / 2;
        canvas.height = img.height / 2;

        // 画像をキャンバスに描画
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 圧縮画像をJPEG形式で取得
        const compressedImage = canvas.toDataURL('image/jpeg', quality);

        // ファイル名を生成
        const originalName = file.name.split('.').slice(0, -1).join('.');
        const extension = file.name.split('.').pop();
        const qualityPercentage = Math.round(quality * 100);
        const newFileName = `${originalName}_compressed_${qualityPercentage}%.${extension}`;

        // 圧縮画像をZIPに追加
        zip.file(newFileName, compressedImage.split(',')[1], { base64: true });

        processedCount++;

        // 全ファイルが処理されたらZIPを生成
        if (processedCount === files.length) {
          zip.generateAsync({ type: 'blob' }).then((zipContent) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipContent);
            link.download = `compressed_images_${qualityPercentage}%.zip`;
            link.textContent = `Download All Compressed Images (ZIP)`;
            link.style.display = 'block';

            const listItem = document.createElement('li');
            listItem.appendChild(link);
            downloadLinks.appendChild(listItem);
          });
        }
      };
    };

    reader.readAsDataURL(file);
  });
}