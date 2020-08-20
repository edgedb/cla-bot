import {Select, InputLabel, Button, FormHelperText} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ErrorPanel, {ErrorProps} from "../../common/error";
import Loader from "../../common/loader";
import {changeHandler} from "../../forms";
import Panel from "../../common/panel";
import {get, post, ApplicationError} from "../../fetch";
import {AgreementListItem} from "../agreements/contracts";
import {Repository, ExternalRepository} from "./contracts";
import ArrayUtils from "../../array";

interface NewRepositoryFormProps {
  onNewRepository: () => void;
  repositories: Repository[];
}

interface NewRepositoryFormState {
  error?: ErrorProps;
  submitError?: ErrorProps;
  loading: boolean;
  submitting: boolean;
  agreements: AgreementListItem[];
  repositories: ExternalRepository[];
  allRepositories: ExternalRepository[];
  selectedAgreementId: string;
  selectedRepositoryFullName: string;
  selectedAgreementIdError: boolean;
  selectedAgreementIdHelperText: string;
  selectedRepositoryFullNameError: boolean;
  selectedRepositoryFullNameHelperText: string;
}

export default class NewRepositoryForm extends Component<
  NewRepositoryFormProps,
  NewRepositoryFormState
> {
  constructor(props: NewRepositoryFormProps) {
    super(props);
    // TODO: would be nice to make repository select multiple!
    // (out of the scope of the MVP)
    this.state = {
      error: undefined,
      submitError: undefined,
      loading: true,
      submitting: false,
      agreements: [],
      repositories: [],
      allRepositories: [],
      selectedAgreementId: "",
      selectedRepositoryFullName: "",
      selectedAgreementIdError: false,
      selectedAgreementIdHelperText: "",
      selectedRepositoryFullNameError: false,
      selectedRepositoryFullNameHelperText: "",
    };
  }

  componentDidUpdate(): void {
    this.checkAvailableRepositories();
  }

  checkAvailableRepositories(): void {
    const configuredRepositories = this.props.repositories;

    const availableRepositories = this.filterAvailableRepositories(
      configuredRepositories,
      this.state.allRepositories
    );

    if (this.state.repositories.length !== availableRepositories.length) {
      // Scenario: the user deleted a repository from configuration,
      // it is therefore possible to create a new configuration for this
      // repository. For example to bind it to a different agreement.

      this.setState({
        repositories: availableRepositories,
        error: this.validateAvailableItems(
          this.state.agreements,
          availableRepositories
        ),
      });
    }
  }

  filterAvailableRepositories(
    configuredRepositories: Repository[],
    externalRepositories: ExternalRepository[]
  ): ExternalRepository[] {
    // Since a repository can only be associated with a single agreement,
    // filter available repositories options, only to those that are not
    // configured yet
    return externalRepositories.filter(
      (externalRepository) =>
        configuredRepositories.find(
          (repository) => repository.fullName === externalRepository.fullName
        ) === undefined
    );
  }

  private validateAvailableItems(
    agreements: AgreementListItem[],
    repositories: ExternalRepository[]
  ): ErrorProps | undefined {
    const hasAgreements = agreements.length > 0;
    const hasRepositories = repositories.length > 0;

    if (hasAgreements && hasRepositories) {
      return;
    }

    let title = "Cannot create a configuration";
    let message;

    if (!hasRepositories) {
      if (this.props.repositories.length) {
        title = "All repositories configured";
        message =
          "All your organization repositories are bound to an Agreement.";
      } else {
        // rare, but it might happen (organization without repositories)
        message =
          "There are no configured repositories for your organization.";
      }
    } else if (!hasAgreements) {
      message =
        "There are no configured agreements in the system. " +
        "Start by configuring an agreement.";
    }

    return {
      title,
      message,
      status: "info",
    };
  }

  load(): void {
    Promise.all([
      get<AgreementListItem[]>("/api/agreements"),
      get<ExternalRepository[]>("/api/external-repositories"),
    ]).then(
      ([agreements, repositories]) => {
        const configuredRepositories = this.props.repositories;

        const availableRepositories = this.filterAvailableRepositories(
          configuredRepositories,
          repositories
        );

        this.setState({
          loading: false,
          agreements: agreements,
          repositories: availableRepositories,
          allRepositories: repositories,
          selectedAgreementId: agreements.length ? agreements[0].id : "",
          error: this.validateAvailableItems(
            agreements,
            availableRepositories
          ),
        });
      },
      () => {
        this.setState({
          loading: false,
          error: {
            retry: () => {
              this.load();
            },
          },
        });
      }
    );
  }

  validate(): boolean {
    let anyError = false;
    const {
      selectedAgreementId,
      selectedRepositoryFullName: selectedRepositoryId,
    } = this.state;

    if (!selectedAgreementId) {
      this.setState({
        selectedAgreementIdError: true,
        selectedAgreementIdHelperText: "Please select a value",
      });
      anyError = true;
    }

    if (!selectedRepositoryId) {
      this.setState({
        selectedRepositoryFullNameError: true,
        selectedRepositoryFullNameHelperText: "Please select a value",
      });
      anyError = true;
    }

    return !anyError;
  }

  updateRepositoriesOptions(repositoryFullName: string): void {
    const {repositories, agreements} = this.state;
    const toRemove = this.state.repositories.find(
      (item) => item.fullName === repositoryFullName
    );
    ArrayUtils.remove(repositories, toRemove);

    this.validateAvailableItems(agreements, repositories);
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.setState({
      submitting: true,
      submitError: undefined,
      error: undefined,
    });

    const {selectedAgreementId, selectedRepositoryFullName} = this.state;

    post("/api/repositories", {
      agreementId: selectedAgreementId,
      repositoryFullName: selectedRepositoryFullName,
    }).then(
      () => {
        this.updateRepositoriesOptions(selectedRepositoryFullName);
        this.setState({
          submitting: false,
          selectedRepositoryFullName: "",
        });

        this.props.onNewRepository();
      },
      (error: ApplicationError) => {
        if (error.status === 409) {
          this.setState({
            submitting: false,
            submitError: {
              title: "Repository already configured",
              message: "There is already a configuration for this repository.",
              status: "info",
            },
          });
          return;
        }

        this.setState({
          submitting: false,
          submitError: {},
        });
      }
    );
  }

  render(): ReactElement {
    const state = this.state;
    const {
      agreements,
      repositories,
      selectedAgreementId,
      selectedRepositoryFullName,
    } = state;

    return (
      <div>
        {state.submitting && <Loader className="overlay" />}
        <Panel
          error={state.error}
          load={() => this.load()}
          loading={state.loading}
        >
          <h1>Bind repository to agreement</h1>
          <dl className="inline">
            <dt>
              <InputLabel id="agreement-select-label">Agreement</InputLabel>
            </dt>
            <dd className="select-parent">
              <Select
                native
                error={state.selectedAgreementIdError}
                id="agreement-select"
                labelId="agreement-select-label"
                value={selectedAgreementId}
                name="selectedAgreementId"
                onChange={changeHandler.bind(this)}
              >
                {agreements.map((agreement) => {
                  return (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.name}
                    </option>
                  );
                })}
              </Select>
              {state.selectedAgreementIdHelperText && (
                <FormHelperText>
                  {state.selectedAgreementIdHelperText}
                </FormHelperText>
              )}
            </dd>
            <dt>
              <InputLabel id="repository-select-label">Repository</InputLabel>
            </dt>
            <dd className="select-parent">
              <Select
                native
                error={state.selectedRepositoryFullNameError}
                id="repository-select"
                labelId="repository-select-label"
                value={selectedRepositoryFullName}
                onChange={changeHandler.bind(this)}
                name="selectedRepositoryFullName"
              >
                <option value=""></option>
                {repositories.map((repository) => {
                  return (
                    <option
                      key={repository.fullName}
                      value={repository.fullName}
                    >
                      {repository.name}
                    </option>
                  );
                })}
              </Select>
              {state.selectedRepositoryFullNameHelperText && (
                <FormHelperText>
                  {state.selectedRepositoryFullNameHelperText}
                </FormHelperText>
              )}
            </dd>
          </dl>
          <div className="buttons-area">
            <Button key="submit-button" onClick={() => this.submit()}>
              Submit
            </Button>
          </div>
        </Panel>
        {state.submitError && <ErrorPanel {...state.submitError} />}
      </div>
    );
  }
}
