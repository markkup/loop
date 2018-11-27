import FirebaseServer = require('firebase-server');

class FirebaseTestServer {

    public initialized: boolean = false;

    public init() {
        if (!this.initialized) {
            this.initialized = true;
            new FirebaseServer(5000, 'localhost', null);
        }
    }
}

export default new FirebaseTestServer();
