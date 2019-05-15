import {Box, Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import {t} from 'app/locale';
import IntegrationIcon from 'app/views/organizationIntegrations/integrationIcon';
import Tooltip2 from 'app/components/tooltip2';
import space from 'app/styles/space';

export default class IntegrationItem extends React.Component {
  static propTypes = {
    integration: PropTypes.object.isRequired,
    compact: PropTypes.bool,
  };

  render() {
    const {integration, compact} = this.props;

    return (
      <Flex>
        <Box>
          <IntegrationIcon size={compact ? 22 : 32} integration={integration} />
        </Box>
        <Labels compact={compact}>
          <IntegrationName data-test-id="integration-name">
            {integration.name}
            {integration.status === 'disabled' && (
              <Tooltip2
                title={t(
                  'This Integration has been disconnected from the external provider'
                )}
              >
                <small> — {t('Disabled')}</small>
              </Tooltip2>
            )}
          </IntegrationName>
          <DomainName compact={compact}>{integration.domainName}</DomainName>
        </Labels>
      </Flex>
    );
  }
}

const Labels = styled('div')`
  box-sizing: border-box;
  display: flex;
  ${p => (p.compact ? 'align-items: center;' : '')};
  flex-direction: ${p => (p.compact ? 'row' : 'column')};
  padding-left: ${space(1)};
  min-width: 0;
`;

const IntegrationName = styled('div')`
  font-size: 1.6rem;
`;

// Not using the overflowEllipsis style import here
// as it sets width 100% which causes layout issues in the
// integration list.
const DomainName = styled('div')`
  color: ${p => (p.compact ? p.theme.gray1 : p.theme.gray3)};
  margin-left: ${p => (p.compact ? space(1) : 'inherit')};
  margin-top: ${p => (!p.compact ? space(0.25) : 'inherit')};
  font-size: 1.4rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
`;
