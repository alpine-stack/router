export default class Router {
    constructor(RouteCollection) {
        this.routeCollection = RouteCollection;
        this.onRoute = ((view, state) => {
            view(state);
        });
        this.onClick = ((e, location) => {
            this._onClick(e, location);
        });
        this.self = this;
    }

    start(handle) {
        handle = () => {
            this.render(window.location.pathname)();
        };
        window.addEventListener('onpopstate', handle);
        window.onclick = (e) => {
            this.onClick(e, this.render);
        };
    }

    render(view, state) {
        view = typeof view === 'string' ? this._getViewFromPath(view) : view;
        return (this.self = this.onRoute(view, state, this.self));
    }

    _onClick(e, location) {
        if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) {
            return;
        }

        let target = e.target;

        while (target && target.localName !== 'a') {
            target = target.parentNode;
        }

        location = window.location;
        if (target && target.host === location.host && !target.hasAttribute('data-no-routing')) {
            this.render(target.pathname);
            e.preventDefault();
        }
    }

    _getViewFromPath(pathname) {
        pathname = pathname || '/';
        window.history.pushState(0, '0', pathname);
        return this._getRoute(this.routeCollection, pathname);
    }

    _getRoute(routeCollection, pathname) {
        if (typeof routeCollection === 'function') {
            return routeCollection;
        }

        if (routeCollection[pathname]) {
            return routeCollection[pathname];
        }

        for (const route in routeCollection) {
            if (routeCollection.hasOwnProperty(route)) {
                const regexify = Router.regexify(route);
                if (regexify.regex.test(pathname)) {
                    const params = {};
                    pathname.replace(regexify.regex, function (args) {
                        args = arguments;
                        for (let i = 1; i < args.length - 2; i++) {
                            params[regexify.keys.shift()] = args[i];
                        }
                        regexify.match = 1;
                    });

                    if (regexify.match) {
                        return (state, actions) => {
                            actions = actions || params;
                            return routeCollection[route](state, actions, params);
                        };
                    }
                }
            }
        }
    }

    static regexify(route) {
        const keys = [];
        const pattern = `^${route
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, (_, name) => {
                keys.push(name);
                return '(\\w+)';
            })}$`;

        return {
            regex: new RegExp(pattern, 'i'),
            keys
        };
    }
}
