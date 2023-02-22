const {Router} = require('express')
const db = require('../database')
const util = require('util');
const router = Router()

router.use((req,res,next)=>{
    console.log("Request made to /POLLS route")
    next()
})

router.get('/',(req,res)=>{
 
    res.sendStatus(200)
})

router.get('posts',(req,res)=>{
    res.json({route:'Posts'})
})

router.post('/',(req,res)=>{
    const {username, password} = req.body 
})

router.get('/polling_units', (req, res) => {
  const sql = 'SELECT * FROM polling_unit';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
    } else {
      res.json(results);
    }
  });

  
});

router.get('/lga', (req, res) => {
  const sql = 'SELECT * FROM lga';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
    } else {
      res.json(results);
    }
  });
});


router.post('/lga', async (req, res) => {
  const {lga_id} = req.body;
  console.log('lga_id',lga_id);
  const lgaArray = [];
  const sql = `SELECT * FROM polling_unit WHERE lga_id = ${lga_id}`;
  db.query(sql, async (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
    } else {
      for (const result of results) {
        const { polling_unit_id } = result;
        const resultSql = `SELECT * FROM announced_pu_results WHERE polling_unit_uniqueid = ${polling_unit_id}`;
        try {
          const resultQuery = util.promisify(db.query).bind(db);
          const announcedResults = await resultQuery(resultSql);
          lgaArray.push({ ...result, announcedResults });
        } catch (error) {
          console.error(error);
          res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
        }
      }
      res.json(lgaArray);
    }
  });
});


router.post('/polling_unit', async (req, res) => {
   const {uniqueid} = req.body;
   console.log('uniqueid',uniqueid)
   const sql = `SELECT * FROM announced_pu_results WHERE polling_unit_uniqueid = ${uniqueid}`
   db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
    } else {
      res.json(results);
    }
  });
  });

  router.get('/allparty', (req, res) => {
    const sql = 'SELECT * FROM announced_pu_results';
    db.query(sql, (err, results) => {
      if (err) {
        console.error(err);
        res.sendStatus(500).json({ error: 'Failed to retrieve data from database' });
      } else {
        res.json(results);
      }
    });
  });

router.post('/polling_units',(req,res)=>{
  const {polling_unit_id, party_scores} = req.body;

  //check if the polling unit already exist, return error
  db.query(`SELECT * FROM polling_unit WHERE polling_unit_id = ${polling_unit_id}`, (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // Polling unit already exists, return error
      res.status(400).json({ error: 'Polling unit already exists' });
    } else {
      // Polling unit doesn't exist, create new one and store results
      db.query(`INSERT INTO polling_unit (polling_unit_id) VALUES (${polling_unit_id})`, (err, results) => {
        if (err) throw err;

        // Insert party scores for the new polling unit
        const values = [];
        for (let party in party_scores) {
          values.push([polling_unit_id, party, party_scores[party]]);
        }

        db.query('INSERT INTO announced_pu_results (polling_unit_uniqueid, party_abbreviation, party_score) VALUES ?', [values], (err, results) => {
          if (err) throw err;

          res.status(201).json({ message: 'Polling unit created and results stored' });
        });
      });
    }
  });
});

  

module.exports = router