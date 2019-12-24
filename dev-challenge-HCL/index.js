
/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')
// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = true;

const url = "ws://localhost:8011/stomp/"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function connectCallback(frame) {
  var tableData =[];
  var sparklineData=[];
  //document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
  client.subscribe("/fx/prices", function(message) {
    var curData=JSON.parse(message.body);
    curData["sparkline"]="";
    tableData.push(curData);
    setInterval(function(){ // sparkline will get refreshed after 30 sec as we want to show mid price of last 30 sec
      sparklineData=[];
    },30000);
    //After getting data ready pass the data to create table function whcih creates table dynamically
    createTable(tableData,sparklineData);
  });
  
 
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

function createTable(tableData,sparklineData){
  console.log("curData",tableData);
  
  //Making column header list constant as these are fixed or we can take from data if it is dynamic
    var cols=[
    "Name", 
    "Current Best Bid Price",
    "Current Best Ask Price",
    "Last Changed Bid Amount",
    "Open Bid Amount",
    "Open Ask Price Amount",
    "Last Changed Ask Price Amount",
    "Sparkline for last midprice"
  ];
  //Creating dynamic table to add rows dynamically
  var tbl = document.createElement("table");
  var tr = tbl.insertRow(-1);
  for(var key in cols){
    var th = document.createElement("th");
    th.innerHTML = cols[key];
    tr.appendChild(th);
  }
  //sorting array first by col lastChangeBid in desc order to show last best bid price changed
  tableData=tableData.sort(function(a, b) {
    return b.lastChangeBid - a.lastChangeBid;
  });
  for(var key=0; key<tableData.length;key++){
    tr=tbl.insertRow(-1);
    for(var j in tableData[key]){
      var tblCell = tr.insertCell(-1);
      if(j != "sparkline"){
        tblCell.innerHTML = tableData[key][j];
      }else{
          //calculation of sparkline data mid price
        sparklineData.push((tableData[key].bestBid+tableData[key].bestAsk)/2);
        var sparkElement = document.createElement('span')
        tblCell.appendChild(sparkElement);
        Sparkline.draw(sparkElement,sparklineData);
      }
      
    }
  }
  var tblContainer = document.getElementById("priceTable");
  tblContainer.innerHTML = "";
  tblContainer.appendChild(tbl);
};

const exampleSparkline = document.getElementById('example-sparkline')
Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])
