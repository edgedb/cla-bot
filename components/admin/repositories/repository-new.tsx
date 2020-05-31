import Layout from "../layout"
import { Select, InputLabel, Button, FormHelperText } from "@material-ui/core";
import { Component, ReactElement } from "react";
import ErrorPanel, { ErrorProps } from "../../common/error"
import Preloader from "../../common/preloader";
import { changeHandler } from "../../forms"
import Panel from "../../common/panel";
import { get, post, ApplicationError } from "../../fetch";
import { AgreementListItem } from "../agreements/contracts";
import { Repository, ExternalRepository } from "./contracts";


interface NewRepositoryFormState {
  error?: ErrorProps
  submitError?: ErrorProps
  loading: boolean
  submitting: boolean
  agreements: AgreementListItem[]
  repositories: ExternalRepository[]
  selectedAgreementId: string
  selectedRepositoryId: string,
  selectedAgreementIdError: boolean,
  selectedAgreementIdHelperText: string
  selectedRepositoryIdError: boolean,
  selectedRepositoryIdHelperText: string
}


export default class NewRepository
extends Component<{}, NewRepositoryFormState> {

  constructor(props: {}) {
    super(props)
    //
    // TODO: make repository select multiple!
    //
    this.state = {
      error: undefined,
      submitError: undefined,
      loading: true,
      submitting: false,
      agreements: [],
      repositories: [],
      selectedAgreementId: "",
      selectedRepositoryId: "",
      selectedAgreementIdError: false,
      selectedAgreementIdHelperText: "",
      selectedRepositoryIdError: false,
      selectedRepositoryIdHelperText: ""
    }
  }

  filterAvailableRepositories(
    configuredRepositories: Repository[],
    externalRepositories: ExternalRepository[]
  ): ExternalRepository[] {
    // Since a repository can only be associated with a single agreement,
    // filter available repositories options, only to those that are not
    // configured yet
    return externalRepositories
      .filter(externalRepository => configuredRepositories
        .find(repository =>
          repository.fullName === externalRepository.fullName
        ) === undefined
      );
  }

  private checkAvailableItems(
    agreements: AgreementListItem[],
    repositories: ExternalRepository[]
  ): ErrorProps | undefined {
    const hasAgreements = agreements.length > 0;
    const hasRepositories = repositories.length > 0;

    if (hasAgreements && hasRepositories) {
      return;
    }

    let message;

    if (!hasRepositories) {
      message = "There are no configured repositories for your organization."
    } else if (!hasAgreements) {
      message = "There are no configured agreements in the system. " +
                "Start by configuring an agreement.";
    }

    return {
      title: "Cannot create a configuration",
      message,
      status: "info"
    };
  }

  load(): void {

    Promise.all([
      get<AgreementListItem[]>("/api/agreements"),
      get<ExternalRepository[]>("/api/external-repositories"),
      get<Repository[]>("/api/repositories")
    ]).then(([agreements, repositories, configuredRepositories]) => {

      const availableRepositories = this.filterAvailableRepositories(
        configuredRepositories,
        repositories
      );

      this.setState({
        loading: false,
        agreements: agreements,
        repositories: availableRepositories,
        selectedAgreementId: agreements.length ? agreements[0].id : "",
        error: this.checkAvailableItems(agreements, availableRepositories)
      })
    }, () => {
      this.setState({
        loading: false,
        error: {
          retry: () => {
            this.load();
          }
        }
      })
    });
  }

  validate(): boolean {
    let anyError = false;
    const {
      selectedAgreementId,
      selectedRepositoryId
    } = this.state;

    if (!selectedAgreementId) {
      this.setState({
        selectedAgreementIdError: true,
        selectedAgreementIdHelperText: "Please select a value"
      })
      anyError = true;
    }

    if (!selectedRepositoryId) {
      this.setState({
        selectedRepositoryIdError: true,
        selectedRepositoryIdHelperText: "Please select a value"
      })
      anyError = true;
    }

    return !anyError;
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.setState({
      submitting: true,
      error: undefined
    });

    const {
      selectedAgreementId,
      selectedRepositoryId
    } = this.state;

    post("/api/repositories", {
      agreementId: selectedAgreementId,
      repositoryId: selectedRepositoryId
    }).then(() => {
      this.setState({
        submitting: false
      });
      location.replace("/admin/repositories");
    }, (error: ApplicationError) => {
      this.setState({
        submitting: false,
        submitError: {}
      });
    });
  }

  render(): ReactElement {
    const state = this.state;
    const {
      agreements,
      repositories,
      selectedAgreementId,
      selectedRepositoryId
    } = state;

    return (
    <Layout title="New repository configuration">
      {state.submitting && <Preloader className="overlay" />}
      <Panel
          error={state.error}
          load={() => this.load()}
          loading={state.loading}
        >
          <h1>Create new repository configuration</h1>
          <dl className="inline">
            <dt>
              <InputLabel id="agreement-select-label">
                Agreement
              </InputLabel>
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
                {
                agreements.map(agreement => {
                  return (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.name}
                    </option>
                  )
                })
                }
              </Select>
              {state.selectedAgreementIdHelperText &&
                <FormHelperText>
                  {state.selectedAgreementIdHelperText}
                </FormHelperText>
              }
            </dd>
            <dt>
              <InputLabel id="repository-select-label">
                Repository
              </InputLabel>
            </dt>
            <dd className="select-parent">
              <Select
                native
                error={state.selectedRepositoryIdError}
                id="repository-select"
                labelId="repository-select-label"
                value={selectedRepositoryId}
                onChange={changeHandler.bind(this)}
                name="selectedRepositoryId"
              >
                <option value=""></option>
                {
                repositories.map(repository => {
                  return (
                    <option
                      key={repository.fullName}
                      value={repository.fullName}
                    >
                      {repository.name}
                    </option>
                  )
                })
                }
              </Select>
              {state.selectedRepositoryIdHelperText &&
                <FormHelperText>
                  {state.selectedRepositoryIdHelperText}
                </FormHelperText>
              }
            </dd>
          </dl>
          <div className="buttons-area">
            <Button
              key="submit-button"
              onClick={() => this.submit()}
            >
              Submit
            </Button>
          </div>
      </Panel>
      {state.submitError && <ErrorPanel {...state.submitError} />}
    </Layout>
    )
  }
}
