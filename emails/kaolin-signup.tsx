import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface SubscriptionThankYouEmailProps {
  firstName?: string;
}

export const SubscriptionThankYouEmail = ({
  firstName,
}: SubscriptionThankYouEmailProps) => (
  <Html>
    <Head />
    <Preview>Thanks for subscribing to Kaolin Chat! 🚀</Preview>
    <Body className="bg-white font-sans">
      <Tailwind>
        <Container className="px-5 mx-auto max-w-2xl font-sans">
          <div className="flex items-center justify-center mt-10 mb-10">
            <div className="text-2xl mr-3">⚡</div>
            <Heading className="text-gray-900 text-3xl font-bold m-0 p-0 font-sans">
              Kaolin Chat
            </Heading>
          </div>

          <Heading className="text-gray-900 text-2xl font-semibold mt-8 mb-6 p-0 font-sans">
            Hey {firstName || "there"}! 👋
          </Heading>

          <Text className="text-gray-700 text-base leading-6 my-4 font-sans">
            Thanks for signing up to be the first to know about{" "}
            <strong>Kaolin Chat</strong>!
          </Text>

          <Text className="text-gray-700 text-base leading-6 my-4 font-sans">
            You're now on the exclusive list for the platform that will let you
            create AI agents in <strong>60 seconds</strong> — the easiest way to
            build intelligent experiences.
          </Text>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-5 my-6">
            <Text className="text-slate-900 text-base leading-6 m-0 font-sans">
              🎯 <strong>What's coming:</strong>
              <br />
              • Create AI chat interfaces in under a minute
              <br />
              • No coding required
              <br />
              • Deploy instantly
              <br />• Professional-grade results
            </Text>
          </div>

          <Text className="text-gray-700 text-base leading-6 my-4 font-sans">
            We will be working hard to make this the most intuitive AI agent
            builder out there and you'll be among the first to get access when
            it's ready!
          </Text>

          <Text className="text-gray-700 text-base leading-6 my-4 font-sans">
            In the meantime, have a sneak peek of the experience{" "}
            <a
              href="https://developerdanwu.com"
              className="text-cyan-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            !
          </Text>

          <Text className="text-gray-700 text-base leading-6 my-8 font-sans">
            Best,
            <br />
            Dan
          </Text>
        </Container>
      </Tailwind>
    </Body>
  </Html>
);

SubscriptionThankYouEmail.PreviewProps = {
  firstName: "Alex",
} as SubscriptionThankYouEmailProps;

export default SubscriptionThankYouEmail;
