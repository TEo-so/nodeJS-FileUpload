var http = require("http");
var querystring = require("querystring");
var url = require("url");
var fs = require("fs");
var path = require('path')

//创建服务器

var server = http.createServer(function(req,res){
     fs.readFile("index.html","utf8",function(err,data){
     res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); 
     res.end(data);
     });
     var pathname = url.parse(req.url).pathname;
     console.log(pathname);
      if(req.url == "/dopost" && req.method.toLowerCase() == "post"){
        if(req.headers['content-type'].indexOf('multipart/form-data')!==-1)
        parseFile(req, res) ;
        
        
     }
    // else {
    //     res.end('其它提交方式')
    // }
    
  
});
server.listen(3000,"127.0.0.1");

function parseFile (req, res) {
    req.setEncoding('binary'); //二进制
    var body = '';   // 文件数据
    var fileName = '';  // 文件名
    // 边界字符串
    var boundary = req.headers['content-type'].split('; ')[1].replace('boundary=','');
    req.on('data', function load(chunk){
      body += chunk;
      loaded = body.length;
    });
    
     req.on('end', function(){      
     var file = querystring.parse(body, '\r\n', ':');
     console.log(body.length);

    // 只处理图片文件
      if (file['Content-Type'].indexOf("image") !== -1)
      {   
        //获取文件名
        var fileInfo = file['Content-Disposition'].split('; ');//MIME
        for (value in fileInfo){
          if (fileInfo[value].indexOf("filename=") != -1){
            fileName = fileInfo[value].substring(10, fileInfo[value].length-1); 
  
          if (fileName.indexOf('\\') != -1){
              fileName = fileName.substring(fileName.lastIndexOf('\\')+1);
            }
            console.log("文件名: " + fileName); 
            
          }   
        }
  
        // 获取图片类型(如：image/gif 或 image/png))
        var entireData = body.toString();           
        var contentTypeRegex = /Content-Type: image\/.*/;
  
        contentType = file['Content-Type'].substring(1); 

        //获取文件二进制数据开始位置，即contentType的结尾
        var upperBoundary = entireData.indexOf(contentType) + contentType.length; 
        var shorterData = entireData.substring(upperBoundary); 
  
        // 替换开始位置的空格
        var binaryDataAlmost = shorterData.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  
        // 去除数据末尾的额外数据，即: "--"+ boundary + "--"
        var binaryData = binaryDataAlmost.substring(0, binaryDataAlmost.indexOf('--'+boundary+'--'));       
  
        // 保存文件

        

        fs.writeFile(path.join(__dirname, `./upload/${fileName}`), binaryData,'binary',function(err) {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
          res.end('图片上传完成');
        });
      } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end('只能上传图片文件'); 
      }
    }); 
  }

