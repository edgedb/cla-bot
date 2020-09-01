import {ReactElement} from "react";

export default function Page(): ReactElement {
  return (
    <div id="presentation">
      <h2>EdgeDB</h2>
      <div id="main-title-wrapper">
        <h1>Contributor License Agreement</h1>
        <a href="/admin/login">Administrator Sign in</a>
      </div>
      <section>
        <h2></h2>
        <p>
          We appreciate community contributions to code repositories open
          sourced by EdgeDB. By signing a contributor license agreement, we
          ensure that the community is free to use your contributions.
        </p>
      </section>
      <section>
        <h2>Sign the CLA</h2>
        <p>
          When you contribute to a EdgeDB open source project on GitHub with a
          new pull request, a bot will evaluate whether you have signed the
          CLA. If required, the bot will comment on the pull request, including
          a link to this system to accept the agreement.
        </p>
      </section>
    </div>
  );
}
