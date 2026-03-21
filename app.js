(function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const totalCount = document.getElementById('totalCount');
    const successCount = document.getElementById('successCount');
    const failCount = document.getElementById('failCount');
    
    let files = [];
    let stats = { total: 0, success: 0, fail: 0 };
    
    function updateStats() {
        totalCount.textContent = stats.total;
        successCount.textContent = stats.success;
        failCount.textContent = stats.fail;
    }
    
    function updateButtons() {
        convertBtn.disabled = files.length === 0;
        clearBtn.disabled = files.length === 0;
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    function sanitizeFileName(name) {
        return name.replace(/[<>:"/\\|?*]/g, '_');
    }
    
    function addFiles(fileArray) {
        for (const file of fileArray) {
            if (file.name.toLowerCase().endsWith('.ncm')) {
                const id = Date.now() + Math.random();
                files.push({
                    id: id,
                    file: file,
                    status: 'pending',
                    result: null,
                    error: null
                });
                
                stats.total++;
                
                renderFileItem({
                    id: id,
                    name: file.name,
                    size: file.size,
                    status: 'pending'
                });
            }
        }
        updateStats();
        updateButtons();
    }
    
    function renderFileItem(item) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.id = 'file-' + item.id;
        
        div.innerHTML = `
            <div class="file-icon">🎵</div>
            <div class="file-info">
                <div class="file-name" title="${item.name}">${item.name}</div>
                <div class="file-status">${formatFileSize(item.size)} - 等待转换</div>
                <div class="progress-bar" style="display: none;">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-download" style="display: none;">下载</button>
                <button class="btn btn-remove">删除</button>
            </div>
        `;
        
        div.querySelector('.btn-remove').addEventListener('click', () => {
            removeFile(item.id);
        });
        
        fileList.appendChild(div);
    }
    
    function updateFileItem(id, updates) {
        const div = document.getElementById('file-' + id);
        if (!div) return;
        
        const statusEl = div.querySelector('.file-status');
        const progressBar = div.querySelector('.progress-bar');
        const progressFill = div.querySelector('.progress-fill');
        const downloadBtn = div.querySelector('.btn-download');
        const removeBtn = div.querySelector('.btn-remove');
        
        if (updates.status === 'processing') {
            div.className = 'file-item processing';
            statusEl.textContent = '正在转换...';
            progressBar.style.display = 'block';
            if (updates.progress !== undefined) {
                progressFill.style.width = (updates.progress * 100) + '%';
            }
        } else if (updates.status === 'success') {
            div.className = 'file-item success';
            statusEl.textContent = `转换成功 - ${updates.format.toUpperCase()} (${formatFileSize(updates.size)})`;
            progressBar.style.display = 'none';
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = () => downloadFile(id);
        } else if (updates.status === 'error') {
            div.className = 'file-item error';
            statusEl.textContent = '转换失败: ' + updates.error;
            progressBar.style.display = 'none';
        }
    }
    
    function removeFile(id) {
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            const file = files[index];
            if (file.status === 'success') stats.success--;
            else if (file.status === 'error') stats.fail--;
            else stats.total--;
            
            files.splice(index, 1);
        }
        
        const div = document.getElementById('file-' + id);
        if (div) div.remove();
        
        updateStats();
        updateButtons();
    }
    
    function downloadFile(id) {
        const file = files.find(f => f.id === id);
        if (!file || !file.result) return;
        
        const blob = new Blob([file.result.audioData], { type: file.result.format.mime });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const songName = sanitizeFileName(file.result.songName);
        const artist = sanitizeFileName(file.result.artist);
        a.download = `${artist} - ${songName}.${file.result.format.ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    
    async function convertFile(fileObj) {
        updateFileItem(fileObj.id, { status: 'processing', progress: 0 });
        
        try {
            const arrayBuffer = await fileObj.file.arrayBuffer();
            
            const result = await NCMDecrypt.parse(arrayBuffer, (progress) => {
                updateFileItem(fileObj.id, { status: 'processing', progress: progress });
            });
            
            fileObj.status = 'success';
            fileObj.result = result;
            stats.success++;
            
            updateFileItem(fileObj.id, {
                status: 'success',
                format: result.format.ext,
                size: result.audioData.length
            });
            
            return true;
        } catch (error) {
            console.error('转换失败:', error);
            fileObj.status = 'error';
            fileObj.error = error.message;
            stats.fail++;
            
            updateFileItem(fileObj.id, {
                status: 'error',
                error: error.message
            });
            
            return false;
        }
    }
    
    async function convertAll() {
        convertBtn.disabled = true;
        
        for (const fileObj of files) {
            if (fileObj.status === 'pending') {
                await convertFile(fileObj);
                updateStats();
            }
        }
        
        updateButtons();
    }
    
    function clearAll() {
        files = [];
        fileList.innerHTML = '';
        stats = { total: 0, success: 0, fail: 0 };
        updateStats();
        updateButtons();
    }
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        addFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        addFiles(e.target.files);
        fileInput.value = '';
    });
    
    convertBtn.addEventListener('click', convertAll);
    clearBtn.addEventListener('click', clearAll);
})();
