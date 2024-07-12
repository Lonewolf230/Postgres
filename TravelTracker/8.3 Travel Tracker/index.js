import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'

const app = express();
const port = 3000;

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  password:"manish23",
  database:"world",
  port:5432
})

db.connect((err)=>{
  if(err){
    console.log(err)
  } 
  else
  {
    console.log("Connected to the database")
  }
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result=await db.query('SELECT * FROM visited_countries')
  let countries=[]
  result.rows.forEach(country=>{
    countries.push(country.country_code)
  })
  return countries
}

app.get("/", async (req, res) => {
  //Write your code here.
  
  let countries=await checkVisited()
  res.render('index.ejs',{countries:countries,total:countries.length})
  
});

app.post("/add",async (request,response)=>{
  const country=request.body.country
  try{
    const result=await db.query('SELECT country_code FROM countries WHERE country_name=$1',[country])
    const ctry=result.rows[0]
    const code=ctry.country_code
    try{
      await db.query('INSERT into visited_countries (country_code) VALUES ($1)',[code])
      response.redirect('/')
    }
    catch(err){
      let countries=await checkVisited()
      response.render('index.ejs',{countries:countries,total:countries.length,error:'Country already exists in the database'})
    }
  }
  catch(err){
    let countries=await checkVisited()
    response.render('index.ejs',{countries:countries,total:countries.length,error:'Country not found in the database'})
  } 
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


