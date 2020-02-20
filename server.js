const  express=require('express')
const path=require('path')
const hbs=require('express-handlebars')
const bodyparser=require('body-parser')
const mysql=require('mysql')
const session=require('express-session')





//express app creation
var app=express()
//configure view engine as hbs
app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0');
  next();
});





app.engine( 'hbs', hbs( {
  extname: 'hbs',
  defaultLayout: 'mainLayout',
  layoutsDir: __dirname + '/views/layouts/'
} ) );


app.use(session({secret:'asdfsdfsdf'}))

//server configuration
app.listen(3000,()=>{
  console.log("Server Started on port:3000");
})
//configure body parser
app.use(bodyparser.json())//enable to transfer data in JSON form
app.use(bodyparser.urlencoded({
  extended:true
}))//unlimited length of data

const con=mysql.createConnection({
host:'localhost',
port:'3307',
database:'emsdb',
user:'root',
password:'root'
})



app.get('/',(req,res)=>{
res.render('login',{uid:req.session.user})
  })

app.post('/loginCheck',(request,response)=>{
var logid=request.body.loginid;
var pwd=request.body.pass;
var sql="select * from login where uid=? and password=?"
var values=[logid,pwd]
sql=mysql.format(sql,values)
con.query(sql,(err,result)=>{
if(err) throw err;
else if(result.length>0)
{
  request.session.user=logid;
response.render('adminhome',{uid:request.session.user})
}else
response.render('login',{msg:'Login Fail,try again'})
})
})


app.get('/newempform',(req,res)=>{
  if(req.session.user==null)
  res.render('login')
res.render('newemp',{uid:req.session.user})
  })

app.post('/insertEmp',(req,res)=>{
var empid=req.body.eid;
var empname=req.body.ename;
var empsalary=req.body.esalary;
var sql="insert into employee values(?,?,?)";
var values=[empid,empname,empsalary]
sql=mysql.format(sql,values)
con.query(sql,(err)=>{
if(err)
throw err;
else
//console.log("Data Inserted");
res.render('newemp',{msg:'Data inserted'})
})


})

app.get('/viewemps',(req,res)=>{
if(req.session.user==null)
res.render('login')
//  var loginuser=req.session.user;
var sql="select * from employee";
con.query(sql,(err,result)=>{
if(err) throw err;
else
  res.render('showEmp',{data:result,uid:req.session.user})
})
})

app.get('/logout',(req,res)=>{
req.session.destroy();
res.render('login',{msg:'Logout successfully'})

})


app.get('/deleteEmp',(req,res)=>{
var empid=req.query.eid;
console.log(empid);
var sql="delete from employee where eid=?"
value=[empid]
sql=mysql.format(sql,value)
con.query(sql,(err,result)=>{
if(err) throw err;
else if(result.affectedRows!=0)
{
  var sql='select * from employee';
  con.query(sql,(err,result)=>{
  if(err) throw err;
  else
    res.render('showEmp',{data:result,uid:req.session.user,msg:'Data Deleted'})
  })
}
})

})

app.get('/forgetpwd',(req,res)=>{
  res.render('forgetpwd')
})

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '$$$$$$$$$$$',
    pass: '##########'
  }
});



app.post('/getPwd',(req,res)=>{
  var email=req.body.email;
var sql='select password from login where uid=?'
var val=[email]
sql=mysql.format(sql,val)
con.query(sql,(err,result)=>{
if(err)
throw err;
else {
   console.log(result[0].password);
   var mailOptions = {
     from: 'demoapitesing@gmail.com',
     to: email,
     subject: 'Password Recover for EMS',
     text: 'Hello '+email+" , your passwword is "+result[0].password
   };
   transporter.sendMail(mailOptions, function(error, info){
     if (error) {
       console.log(error);
     } else {
res.render('forgetpwd',{msg:'Password is sent on your mail id'})
      // console.log('Email sent: ' + info.response);
     }
   });





}
})

})






























//
