let mysql = require('./sqlSetup')
let express = require('express')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const port = 3000
app.use(express.static(__dirname + '/public'))

app.get('/', (req,res,next) => {
    var context = {};
     
        res.sendFile(__dirname + "/index.html");
      
    });

app.post('/', (req, res, next) => {
    let data = {}
    data.name = req.body.name
    if (req.body.reps != ''){
      data.reps = Number(req.body.reps)
    } else {
      data.reps = null
    }

    if (req.body.weight != ''){
      data.weight = Number(req.body.weight)
    } else {
      data.weight = null
    }
    data.date = req.body.date
    if (req.body.units == 'lbs'){
      data.units = true
    } else {
      data.units = false
    }

    mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [data.name, data.reps, data.weight, data.date, data.units], function(err, result){
      if(err){
        next(err);
        return;
      }
      mysql.pool.query("SELECT id, name, reps, weight, lbs, DATE_FORMAT(date,'%m/%d/%Y') as date FROM workouts where id=" + result.insertId, function(err, rows, fields) {
        res.json(rows[0])
      })
    })

    
  })

  app.get('/get-data', (req, res) => {
    let data = []
  mysql.pool.query("SELECT id, name, reps, weight, lbs, DATE_FORMAT(date,'%m/%d/%Y') as date FROM workouts", function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    data.push(rows);
    res.json(data)
    });
  })

  app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
      var createString = "CREATE TABLE workouts("+
      "id INT PRIMARY KEY AUTO_INCREMENT,"+
      "name VARCHAR(255) NOT NULL,"+
      "reps INT,"+
      "weight INT,"+
      "date DATE,"+
      "lbs BOOLEAN)";
      mysql.pool.query(createString, function(err){
        context.results = "Table reset";
        res.redirect('/');
      })
    });
  });

app.get('/insert',function(req,res,next){
    var context = {};
    mysql.pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.name], function(err, result){
      if(err){
        next(err);
        return;
      }
      context.results = "Inserted id " + result.insertId;
      res.render('home', context);
    });
  });

  
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })

app.delete('/delete/:id', (req, res) => {
  mysql.pool.query("DELETE from workouts where id="+req.params.id, function(err, result){
    if(err){
      next(err)
      console.log(err)
      return
    }
    res.json(result)
  })
})

app.put('/update', (req, res, next) => {
  let data = {}
    data.name = req.body.name
    if (req.body.reps != ''){
      data.reps = Number(req.body.reps)
    } else {
      data.reps = null
    }

    if (req.body.weight != ''){
      data.weight = Number(req.body.weight)
    } else {
      data.weight = null
    }
    data.date = req.body.date
    if (req.body.units == 'lbs'){
      data.units = true
    } else {
      data.units = false
    }

    data.id = req.body.id

    mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?", [data.name, data.reps, data.weight, data.date, data.units, data.id], function(err, result){
      if(err){
        next(err);
        return;
      }
      res.json(data)
    })
})
