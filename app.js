var storage = require('node-persist');
var crypto = require("crypto-js");
storage.initSync();

var argv = require("yargs")
    .command('create', 'Yeni bir hesap oluşturur', function (yargs) {
        yargs.options({
            name: {
                demand: true,
                alias: 'n',
                description: 'Hesap adı (Twitter, Facebook...)',
                type: 'string'
            },
            username: {
                demand: true,
                alias: 'u',
                description: 'Hesabın kullanıcı adı',
                type: 'string'
            },
            password: {
                demand: true,
                alias: 'p',
                description: 'Hesabınıza ait parola',
                type: 'string'
            },
            masterPassword: {
                demand: true,
                alias: 'm',
                description: 'İşlem yapabilmek için gerekli olan şifredir',
                type: 'string'
            }
        }).help('help');
    })
    .command('get', 'Hesap bilgilerini görüntülemeyi sağlar', function (yargs) {
        yargs.options({
            name: {
                demand: true,
                alias: 'n',
                description: 'Hesap adı (Twitter, Facebook..)',
                type: 'string'
            },
            masterPassword: {
                demand: true,
                alias: 'm',
                description: 'İşlem yapabilmek için gerekli olan şifredir!!!',
                type: 'string'
            }
        }).help('help');
    }).help('help')
    .argv;
var command = argv._[0];


function getAccounts(masterPassword){

    // getItemSync accounts verisini cek
    var encryptedAccounts = storage.getItemSync("accounts");
    var accounts = [];
   
    // decrypt
    if(typeof encryptedAccounts !== 'undefined'){
        var bytes = crypto.AES.decrypt(encryptedAccounts, masterPassword);
        accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
    }
    // return accounts array
    return accounts;

}

function saveAccounts(accounts, masterPassword) {
    // encrypt accounts
    var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword)
   
    //setItemSyncs
    storage.setItemSync("accounts", encryptedAccounts.toString());

    // return accounts
    return accounts;
}

function createAccount(account, masterPassword) {

    // Önceki kayıtları al getItemSync ile

    //var accounts = storage.getItemSync("accounts");

    // getAccounts()
    
    var accounts = getAccounts(masterPassword);

    // Eğer önceki kayıt yoksa, array oluştur

    /* if(typeof accounts === 'undefined'){
        accounts = [];
    }
    */

    // account verisini array içerisine kaydet
    accounts.push(account);

    // setItemsSync ile kalıcı olarak kaydet
    //storage.setItemSync("accounts", accounts);

    //save accounts()
    saveAccounts(accounts, masterPassword);

    return account;

}

function getAccount(accountName, masterPassword) {

    var accounts = getAccounts(masterPassword);
    var matchedAccount;

    // forEach ile butun kayitlari dolasarak accountName bulunacak
    accounts.forEach(function (account) {
        if (account.name === accountName) {
            matchedAccount = account;
        }
    })
    return matchedAccount;
}

if (command === 'create' && typeof argv.name !== 'undefined' && argv.name.length > 0 && typeof argv.username !== 'undefined' && argv.username.length > 0 && typeof argv.password !== 'undefined' && argv.password.length > 0 && typeof argv.masterPassword !== 'undefined' && argv.masterPassword.length > 0) {

    try {
        var createdAccount = createAccount({
            name: argv.name,
            username: argv.username,
            password: argv.password
        }, argv.masterPassword);
        console.log("Hesap olusturuldu");
    } catch (e) {
        console.log("Hesap oluşturulamadı")
    }

    
} else if (command === 'get' && typeof argv.name !== 'undefined' && argv.name.length > 0 && typeof argv.masterPassword !== 'undefined' && argv.masterPassword.length > 0) {

   try {
    var account = getAccount(argv.name, argv.masterPassword);

    if (typeof account !== 'undefined') {
        console.log(account);
    } else {
        console.log("Aradığınız kayıt bulunamamıştır");
    }
   } catch (e) {
       console.log("Hesap getirilemedi")
   }

} else {
    console.log("Lütfen geçerli bir komut giriniz");
}

