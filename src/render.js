import mainTemplate from './src/templates/main.html!text'
import rp from 'request-promise'

export async function render() {
	 return rp({
        uri: 'https://interactive.guim.co.uk/docsdata-test/1VXBeHCsgJB-SUXjgIlfZk2W8qdZicCw7vs4JWd4lkJY.json',
        json: true
    }).then((data) => {

    	
    	let d = formatData(data);
		console.log(d);
        //let html = compileHTML(d);

        return mainTemplate;
    });

}


function formatData(data) {
    var newObj = {};
    let count = 0;

    data.sheets.Sheet2.map((obj,k) => {
    	obj.ref = k;
    })

    let groups = groupBy(data.sheets.Sheet1, 'Cabinet');

    groups = sortByKeys(groups);

    groups.map((obj, k) => {
    	obj.groupRef = k;
        obj.objArr.map((ob) => {
        	ob.groupRef = obj.groupRef;
        	console.log(ob)
        })

        // headGroup.map((headOb) => {
        //     if(headOb['card-group'] == obj.sortOn )  {
        //         obj.Header = headOb.Header;
        //         obj.Standfirst = headOb.Standfirst;
        //     }
        // })


    });

    newObj.groups = groups;

    return newObj;
}


function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}


function sortByKeys(obj) {
    let keys = Object.keys(obj), i, len = keys.length;
    keys.sort();

    var a = []

    for (i = 0; i < len; i++) {
        let k = keys[i];
        let t = {}
        t.sortOn = k;
        t.objArr = obj[k]
        a.push(t);
    }

    return a;
}