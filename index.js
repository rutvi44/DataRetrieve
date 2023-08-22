
const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

app.use(express.static(path.join(__dirname, 'Public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb://127.0.0.1:27017/Ass4', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});;

const Receipt = mongoose.model('Receipt', {
  name: String,
  address: String,
  city: String,
  province: String,
  phone: String,
  email: String,
  product1: String,
  product2: String,
  grossAmount: String,
  taxAmount: String,
  totalCost: String,
});

app.get('/', function (req, res) {
  res.render('main', { errors: [] });
});

app.post(
  '/reciept',[
    check('name', 'Name is required (in format Chris Mihalski)').notEmpty().matches(/^[a-zA-Z\s]+$/),
    check('address', 'Address is required').notEmpty(),
    check('city', 'City is required').notEmpty(),
    check('province', 'Please select Province').notEmpty(),
    check('phone', 'Phone number is required').notEmpty(),
    check('phone', 'Phone number should be in format 123-123-1234').matches( /^\d{3}-\d{3}-\d{4}$/),
    check('email', 'Email is required').notEmpty(),
    check('email', 'Invalid email format (test@test.com)').matches(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/),
    check('product1', 'Please enter a valid quantity for Maple Syrup').isInt({ min: 0 }),
    check('product2', 'Please enter a valid quantity for Honey').isInt({ min: 0 }),
  ],
  function (req, res) {

    const errors = validationResult(req).array();

    var name = req.body.name;
    var address = req.body.address;
    var city = req.body.city;
    var province = req.body.province;
    var phone = req.body.phone;
    var email = req.body.email;
    var product1 = parseInt(req.body.product1) || 0; 
    var product2 = parseInt(req.body.product2) || 0;

    let tax;

    if (errors.length > 0) {
      console.log(errors);
      res.render('main', { errors });
    } else {
      switch (province) {
        case 'Ontario':
          tax = 13;
          break;
        case 'Alberta':
          tax = 5;
          break;
        case 'BritishColumbia':
          tax = 12;
          break;
        case 'Manitoba':
          tax = 13;
          break;
        case 'NewBrunswick':
          tax = 15;
          break;
        case 'NewfoundlandandLabrador':
          tax = 15;
          break;
        case 'NovaScotia':
          tax = 15;
          break;
        case 'PrinceEdwardIsland':
          tax = 15;
          break;
        case 'Quebec':
          tax = 14.98;
          break;
        case 'Saskatchewan':
          tax = 11;
          break;
        case 'NorthwestTerritories':
          tax = 5;
          break;
        case 'Nunavut':
          tax = 5;
          break;
        case 'Yukon':
          tax = 5;
          break;
        default:
          tax = 5;
      }

      const item1 = 18;
      const item2 = 8;
      const item1Quantity = parseInt(product1);
      const item2Quantity = parseInt(product2);
      const grossAmount = (item1Quantity * item1) + (item2Quantity * item2);
      const taxAmount = grossAmount * tax / 100;
      const totalCost = grossAmount + taxAmount;

      const finalData = {
        name: name,
        address: address,
        city: city,
        province: province,
        phone: phone,
        email: email,
        product1: product1,
        product2: product2,
        grossAmount: grossAmount,
        taxAmount: taxAmount,
        totalCost: totalCost,
      };

      const newReceipt = new Receipt(finalData);

       newReceipt.save().then(savedReceipt => {
        console.log('Receipt Data Saved', savedReceipt);

      if (grossAmount >= 10) {
        res.render('reciept', finalData);
      } else {
        const errors = [{ msg: 'Please buy products worth $10 or more' }];
        res.render('main', { errors });
      }
    }).catch(err => {
      console.error('Error saving receipt data:', err);
    });
    }

    app.get('/orders', function(req,res){
      Receipt.find({}).then(orders => {
        res.render('orders', {orders: orders});
      }).catch(err => {
        console.error('Error Fetching all orders', err)
      });     
    })
    
    
  }
);

const port = 4499;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
