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
















//
