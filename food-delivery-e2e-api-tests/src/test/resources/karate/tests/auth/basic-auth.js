function fn(user) {
    if (user.user === 'admin') {
        return { username: 'admin', password: 'admin' };
    }
    if (user.user === 'customer') {
        return { username: 'customer', password: 'customer' };
    }
    if (user.user === 'courier') {
        return { username: 'courier', password: 'courier' };
    }
}
