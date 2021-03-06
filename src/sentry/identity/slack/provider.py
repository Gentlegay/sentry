from __future__ import absolute_import

from sentry import options
from sentry.identity.oauth2 import OAuth2Provider


class SlackIdentityProvider(OAuth2Provider):
    key = 'slack'
    name = 'Slack'

    # This identity provider is used for authorizing the Slack application
    # through their Bot token (or legacy Workspace Token if enabled) flow.
    oauth_access_token_url = 'https://slack.com/api/oauth.access'
    oauth_authorize_url = 'https://slack.com/oauth/authorize'

    oauth_scopes = (
        'identity.basic',
        'identity.email',
    )

    def get_oauth_client_id(self):
        return options.get('slack.client-id')

    def get_oauth_client_secret(self):
        return options.get('slack.client-secret')

    def get_oauth_data(self, payload):
        # TODO(epurkhiser): This flow isn't actually used right now in sentry.
        # In slack-bot world we would need to make an API call to the 'me'
        # endpoint to get their user ID here.
        return super(SlackIdentityProvider, self).get_oauth_data(self, payload)

    def build_identity(self, data):
        data = data['data']

        return {
            'type': 'slack',
            # TODO(epurkhiser): See note above
            'id': data['user']['id'],
            'email': data['user']['email'],
            'scopes': sorted(data['scope'].split(',')),
            'data': self.get_oauth_data(data),
        }
