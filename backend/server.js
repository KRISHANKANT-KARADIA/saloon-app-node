const express =require("express");
const app =express();
const admin =require("firebase-admin");
const credentials=require("./serviceAccountKey.json");

admin.initializeApp({
  credential:admin.credential.cert(credentials)
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const PORT =process.env.PORT || 8080;
app.prependOnceListener(PORT,()=>{
  console.log('server is running on Port ${PORT}.');
});