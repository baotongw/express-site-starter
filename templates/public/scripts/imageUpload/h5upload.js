var handler = {
    init: function () {
        var self = this;
        this.$dropbox = $('#dropbox');
        this.$fileSelect = $('#fileSelect');
        this.$img = this.$dropbox.find('img');

        this.$dropbox.on('dragover', function (e) {
            e.preventDefault();
        });

        this.$dropbox.on('drop', function (e) {
            e.preventDefault();
            var file = event.dataTransfer.files[0];
            self.handleDrop($(this), file);
        });

        this.$fileSelect.on('change', function (e) {
            if (!this.value) return;
            var file = this.files[0];
            self.handleDrop($(this).closest(".dropbox"), file);
            this.value = "";
        });
    },
    handleDrop: function ($box, file) {
        this.readImgFile(file, $box);
    },
    readImgFile: function (file, $box) {
        var self = this;

        EXIF.getData(file, function () {
            var orientation = this.exifdata.Orientation,
                rotateDeg = 0;
            var allMetaData = EXIF.getAllTags(this);

            console.log(allMetaData);

            //如果不是ios拍的照片或者是横拍的，则不用处理，直接读取
            if (typeof orientation === "undefined" || orientation === 1) {
                //原本的readImgFile，添加一个rotateDeg的参数
                self.doReadImgFile(file, $box, rotateDeg);
            }
            //否则用canvas旋转一下
            else {
                rotateDeg = orientation === 6 ? 90 * Math.PI / 180 :
                    orientation === 8 ? -90 * Math.PI / 180 :
                        orientation === 3 ? 180 * Math.PI / 180 : 0;
                self.doReadImgFile(file, $box, rotateDeg);
            }
        });
    },
    doReadImgFile: function (file, $box, rotateDeg) {
        // 使用源生方法读取图片
        var self = this;
        var reader = new FileReader(file);

        //检验用户是否选则是图片文件
        if (file.type.split("/")[0] !== "image") {
            alert("You should choose an image file");
            return;
        }

        reader.onload = function (event) {
            //获取图片base64内容
            var base64 = event.target.result;
            var ONE_MB = 1024 * 1024;

            //如果图片大于1MB，将body置半透明
            if (file.size > ONE_MB) {
                $("body").css("opacity", 0.5);
            }
            //因为这里图片太大会被卡一下，整个页面会不可操作
            var virtualImg = new Image()

            virtualImg.src = base64;
            virtualImg.onload = function () {
                //然后再调一个压缩和上传的函数
                self.compressAndUpload(virtualImg, file, $box, rotateDeg);

                //还原
                if (file.size > ONE_MB) {
                    $("body").css("opacity", 1);
                }
            }
        }

        reader.readAsDataURL(file);
    },
    compressAndUpload: function (virtualImg, file, $box, rotateDeg) {
        var maxWidth = 300;
        this.compress(virtualImg, maxWidth, file.type, rotateDeg);
        var img = this.$img[0];

        this.upload(img, file);
        // var image = document.getElementById('image');
        // var cropper = new Cropper(img, {
        //     aspectRatio: 16 / 9,
        //     crop: function (e) {
        //         console.log(e.detail.x);
        //         console.log(e.detail.y);
        //         console.log(e.detail.width);
        //         console.log(e.detail.height);
        //         console.log(e.detail.rotate);
        //         console.log(e.detail.scaleX);
        //         console.log(e.detail.scaleY);
        //     }
        // });
    },
    compress: function (virtualImg, maxWidth, mimeType, rotateDeg) {
        //创建一个canvas对象
        var cvs = document.createElement('canvas');
        var width = virtualImg.naturalWidth,
            height = virtualImg.naturalHeight,
            imgRatio = width / height;
        //如果图片维度超过了给定的maxWidth 1500，
        //为了保持图片宽高比，计算画布的大小

        if (width > maxWidth) {
            width = maxWidth;
            height = width / imgRatio;
        }
        cvs.width = width;
        cvs.height = height;

        // 将图片画到画布上
        var ctx = cvs.getContext('2d');

        var destX = 0,
            destY = 0;

        if (rotateDeg) {
            ctx.translate(cvs.width / 2, cvs.height / 2);
            ctx.rotate(rotateDeg);
            destX = -width / 2,
                destY = -height / 2;
        }

        ctx.drawImage(virtualImg, 0, 0, virtualImg.naturalWidth, virtualImg.naturalHeight, 0, 0, width, height);
        //图片质量进行适当压缩
        var quality = width >= 1500 ? 0.5 : width > 600 ? 0.6 : 1;
        //导出图片为base64
        var newImageData = cvs.toDataURL(mimeType, quality);

        this.$img.attr('src', newImageData);

        cvs = null;
        // return compress img
        // var resultImg = new Image();
        // resultImg.src = newImageData;
        // return resultImg;
    },
    upload: function (img, file) {
        var upload_url = '';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', upload_url, true);
        var boundary = 'someboundary';
        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);

        var data = img.src;
        data = data.replace('data:' + file.type + ';base64,', '');
        xhr.sendAsBinary([
            //name=data
            '--' + boundary,
            'Content-Disposition: form-data; name="data"; filename="' + file.name + '"',
            'Content-Type: ' + file.type, '',
            atob(data), '--' + boundary,
            //name=docName -- another file
            // '--' + boundary,
            // 'Content-Disposition: form-data; name="docName"', '',
            // file.name,
            // '--' + boundary + '--'
        ].join('\r\n'));

        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                duringCallback((event.loaded / event.total) * 100);
            }
        };
        
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    successCallback(this.responseText);
                } else if (this.status >= 400) {
                    if (errorCallback && errorCallback instanceof Function) {
                        errorCallback(this.responseText);
                    }
                }
            }
        };

        xhr.sendAsBinary();
    }
}

handler.init();