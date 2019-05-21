import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';

import {addErrorMessage} from 'app/actionCreators/indicator';
import {createProject} from 'app/actionCreators/projects';
import {stepPropTypes} from 'app/views/onboarding/wizardNew';
import {t, tct} from 'app/locale';
import Button from 'app/components/button';
import PlatformPicker from 'app/components/platformPicker';
import ProjectActions from 'app/actions/projectActions';
import SentryTypes from 'app/sentryTypes';
import space from 'app/styles/space';
import withApi from 'app/utils/withApi';
import withTeams from 'app/utils/withTeams';

const platformListStyle = css`
  max-height: 420px;
  overflow-y: scroll;
  /* Needed to fix overflow cropping of the de-select button */
  margin-top: -${space(2)};
  padding-top: ${space(2)};
`;

class OnboardingPlatform extends React.Component {
  static propTypes = {
    ...stepPropTypes,
    api: PropTypes.object,
    teams: PropTypes.arrayOf(SentryTypes.Team),
  };

  state = {
    /**
     * This will be flipped to true immedaitely before  creating the first
     * project. We use state here to avoid the intermittent prop value where
     * the project is created but the store hasn't propagated its value to the
     * component yet, leaving a brief period where the button will flash
     * between labels / disabled states.
     */
    firstProjectCreated: false,
    /**
     * `progressing` indicates that we are moving to the next step. Again, this
     * is kept as state to avoid intermittent states causing flickering of the
     * button.
     */
    progressing: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.active && !this.props.active) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({progressing: false});
    }
  }

  get hasFirstProject() {
    return this.props.project || this.state.firstProjectCreated;
  }

  get contineButtonLabel() {
    if (this.state.progressing) {
      return t('Creating Project...');
    }
    if (!this.hasFirstProject) {
      return t('Create Project');
    }
    if (!this.props.active) {
      return t('Project Created');
    }
    return t('Setup Your Project');
  }

  async createFirstProject(platform) {
    const {api, orgId, teams} = this.props;

    if (this.props.project) {
      return;
    }

    if (teams.length < 1) {
      return;
    }

    this.setState({firstProjectCreated: true});

    try {
      const data = await createProject(api, orgId, teams[0].slug, orgId, platform);
      ProjectActions.createSuccess(data);
    } catch (error) {
      addErrorMessage(t('Failed to create project'));
      throw error;
    }
  }

  handleSetPlatform = platform => {
    const {onUpdate, onReturnToStep} = this.props;

    if (platform) {
      onUpdate({platform});
    } else {
      // Platform de-selected
      onReturnToStep({platform});
    }
  };

  handleContinue = async () => {
    this.setState({progressing: true});
    // Create their first project if they don't already have one. This is a
    // no-op if they already have a project.
    await this.createFirstProject(this.props.platform);
    this.props.onComplete();
  };

  render() {
    const {active, project, platform, scrollTargetId} = this.props;

    const selectedPlatform = platform || project?.platform;

    const continueDisabled =
      !selectedPlatform || this.state.progressing || (this.hasFirstProject && !active);

    return (
      <React.Fragment>
        <p>
          {tct(
            `Sentry integrates with many different languages and platforms
             through the official [strong:Sentry SDKs]. Select your platform
             from the list below to see a tailored installation process for
             Sentry.`,
            {strong: <strong />}
          )}
        </p>
        <p>
          {tct(
            `Not seeing your platform in the list below? Select the
             [strong:other platform], and use a community client!`,
            {strong: <strong />}
          )}
        </p>
        <PlatformPicker
          noAutoFilter
          listProps={{className: platformListStyle, id: scrollTargetId}}
          platform={selectedPlatform}
          setPlatform={this.handleSetPlatform}
        />
        <Button
          priority="primary"
          disabled={continueDisabled}
          onClick={this.handleContinue}
        >
          {this.contineButtonLabel}
        </Button>
      </React.Fragment>
    );
  }
}

export default withApi(withTeams(OnboardingPlatform));
