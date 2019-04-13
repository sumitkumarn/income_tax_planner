var ctc = 0;
var cases = 1;
resultArray = [];
var standardDeduction = 50000;
var inputHash = {};
var pfDeductionElements = 'pfDeductionElements';
var hraElements = 'hraElements';
var homeLoanElements = 'homeLoanElements';
var homeLoanPrincipalElements = 'homeLoanPrincipalElements';
var fbpElements = 'fbpElements';
var otherInvestmentElements = 'otherInvestmentElements';

var investmentHTML = '<div id="case%id%"> <table> <tbody> <tr> <td> <b>Case %id%</b> </td></tr></tbody> </table> <table> <tbody> <tr> <td><label for="PF">PF Contribution</label> </td><td> <select id="pfOption%id%" onchange="populatePF(%id%,this.value)"> <option name="default" value="0">Default - 1800 per month</option> <option name="percentWise" value="1">12% of Basic Salary </option> </select> </td><td> <label for="pfDeduction" id="pfDeduction%id%" class="pfDeduction">21600</label> </td></tr><tr> <td><label for="HRA">HRA</label> </td><td><input type="number" id="hra%id%" class="hra" defaultValue="0" placeholder="0"></td></tr><tr> <td><label for="Home Loan Interest">Home Loan Interest</label> </td><td><input type="number" id="homeLoan%id%" class="homeLoan"  defaultValue="0" placeholder="0"></td></tr><tr><td><label for="Home Loan Principal">Home Loan Principal</label> </td><td><input type="number" id="homeLoanPrincipal%id%" class="homeLoanPrincipal" defaultValue="0" placeholder="0"></td></tr><tr><td><label for="Flexible Benefit Plan">Flexible Benefit Plan</label> </td><td><input type="number" id="fbp%id%" class="fbp" defaultValue="0" placeholder="0"></td></tr><tr> <td><label for="Other Investments">Other Investments<b>( For tax exemption)</b></label> </td><td><input type="number" id="otherInvestment%id%" class="otherInvestment" defaultValue="0" placeholder="0"></td></tr><tr> <td><br/></td></tr></tbody> </table> </div>';


var resultRowHTML = '<tr id="row"><td><b>%id%</b></td><td><b>%takeHomeIncome%</b></td><td><b>%monthlyTakeHomeIncome%</b></td><td><b>%totalTax%</b></td><td><b>%pfSavings%</b></td><td><b>%investments%</b></td></tr>';

document.querySelector('#ctc').addEventListener('input',function(){
    ctc = this.value
    var pfDeductionElementsList = document.getElementsByClassName('pfDeduction');
    for (i = 1; i <= pfDeductionElementsList.length; ++i) {
        populatePF(i, document.getElementById('pfOption'+i).value);
    }

},false);

populatePF = function(caseId,pfOption){
    var pfDeduction = 21600;
    if(pfOption == 1){
        pfDeduction = 0.12 * (ctc/2);
    }
    document.querySelector('#pfDeduction'+caseId).innerHTML = pfDeduction;
}


addNewCase = function(){
    cases++;
    newInvestmentHTML  = investmentHTML.replace(/%id%/g,cases);
    element = '#case'+(cases-1);
    document.querySelector(element).insertAdjacentHTML('afterend',newInvestmentHTML);
}

processInput = function(){
    resetResults();
    parseInputs();
    calculateResults();
    displayResults();
}

resetResults = function(){
    resultArray = [];
}


parseInputs = function(){

    inputHash[pfDeductionElements] = document.getElementsByClassName('pfDeduction');
    inputHash[hraElements] = document.getElementsByClassName('hra');
    inputHash[homeLoanElements] = document.getElementsByClassName('homeLoan');
    inputHash[homeLoanPrincipalElements] = document.getElementsByClassName('homeLoanPrincipal');
    inputHash[fbpElements] = document.getElementsByClassName('fbp');
    inputHash[otherInvestmentElements] = document.getElementsByClassName('otherInvestment');    
}

calculateResults = function() {
    maxAllowedHRA = ctc/4;
    maxAllowedHomeLoanInterest = 200000;
    balanceInSec80C = 150000;
    for(i=1;i<=cases;i++){
        taxableIncome = ctc - standardDeduction;
        takeHomeIncome = ctc;
        j =i-1;
        var resultHash = {};
        if(inputHash[pfDeductionElements][j]){
            pfSavings = inputHash[pfDeductionElements][j].innerText;
            taxableIncome-=pfSavings * 3;
            pfDeducted = pfSavings * 2;
            takeHomeIncome-= pfDeducted;
            resultHash['pfSavings'] = pfDeducted;
            balanceInSec80C-= pfSavings > balanceInSec80C ? balanceInSec80C : pfSavings;
        }
        if(inputHash[hraElements][j]){
            declaredHRA = inputHash[hraElements][j].value;
            taxableIncome-= declaredHRA > maxAllowedHRA ? maxAllowedHRA : declaredHRA;
        }
        if(inputHash[homeLoanElements][j]){
            declaredHomeLoanInterest = inputHash[homeLoanElements][j].value;
            taxableIncome-= declaredHomeLoanInterest > maxAllowedHomeLoanInterest ? maxAllowedHomeLoanInterest : declaredHomeLoanInterest;
        }
        if(inputHash[homeLoanPrincipalElements]){
            homeLoanPrincipalAmt = inputHash[homeLoanPrincipalElements][j].value;
            if(balanceInSec80C > 0){
                taxableIncome-= homeLoanPrincipalAmt > balanceInSec80C ? balanceInSec80C : homeLoanPrincipalAmt;
            }
        }

        if(inputHash[fbpElements][j]){
            taxableIncome-= inputHash[fbpElements][j].value;
        }
        if(inputHash[otherInvestmentElements][j]){
            otherInvestments = inputHash[otherInvestmentElements][j].value;
            taxableIncome-=otherInvestments;
            resultHash['investments'] = otherInvestments == "" ? 0 : otherInvestments;
        }
        totalTax = calculateTax(taxableIncome);
        takeHomeIncome-=totalTax;
        resultHash['totalTax'] = totalTax;
        resultHash['takeHomeIncome'] = takeHomeIncome;
        resultArray.push(resultHash);
    }
    console.log(resultArray);
}

displayResults = function(){

    for(i=0;i<resultArray.length;i++){
        rowDataHash = resultArray[i];
        rowHTML = resultRowHTML;
        rowHTML = rowHTML.replace('%id%',i+1);
        rowHTML = rowHTML.replace('%takeHomeIncome%',rowDataHash['takeHomeIncome']);
        rowHTML = rowHTML.replace('%monthlyTakeHomeIncome%',Math.floor(rowDataHash['takeHomeIncome']/12));
        rowHTML = rowHTML.replace('%totalTax%',rowDataHash['totalTax']);
        rowHTML = rowHTML.replace('%pfSavings%',rowDataHash['pfSavings']);
        rowHTML = rowHTML.replace('%investments%',rowDataHash['investments']);
        document.querySelector('#resultTable').insertAdjacentHTML('beforeend',rowHTML);
    }

}

function calculateTax(taxableIncome){

    tax = 0;
    if(taxableIncome > 1000000){
        tax = (taxableIncome-1000000)*0.3 + 112500;
    }else if(taxableIncome>500000 && taxableIncome<=1000000){
        tax =  (taxableIncome-500000)*0.2 + 12500;
    }
    tax += (tax*0.04) // cess
    return tax;
}


