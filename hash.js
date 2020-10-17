const bcrypt = require('bcrypt');
bcrypt.hash('barfoo', 12).then(console.log);
