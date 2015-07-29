var React = require('react-native');
var {
    Image
    } = React;

const SIZE = 20;
const HTTP_HUB_URL = 'http://hackathon15.labs.intellij.net:8080/hub';

class Avatar extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        this.loadAvatarUrl(this.props.authorLogin);
    }

    loadAvatarUrl(authorLogin) {
        this.props.api.getUser(authorLogin)
            .then((user) => {
                if (user.avatarUrl) {
                    return user.avatarUrl;
                } else {
                    return this.props.api.getUserFromHub(HTTP_HUB_URL, user.ringId)
                        .then(user => user.avatar.url);
                }
            })
            .then(avatarUrl => this.setState({avatarUrl}))
            .catch(() => {
                console.warn('Cant load user', authorLogin);
            });
    }

    render() {
        return <Image style={this.props.style} source={{uri: this.state.avatarUrl}}/>
    }
}

module.exports = Avatar;