using CastServer.MediaSources;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using System.Linq;

namespace CastServer.Tests
{
    [TestClass]
    public class DlnaDataParserTests
    {
        [TestMethod]
        [DeploymentItem(@"TestData\TopLevelContainers.txt", @"TestData")]
        public void CanParseTopLevelContainers()
        {
            var xmlString = File.ReadAllText(@"TestData\TopLevelContainers.txt");
            var actual = DlnaDataParser.FromXmlString(xmlString).ToList();
            Assert.IsNotNull(actual);
            Assert.AreEqual(4, actual.Count);
            Assert.AreEqual("Browse Folders", actual[0].title);
            Assert.AreEqual("Music", actual[1].title);
            Assert.AreEqual("Pictures", actual[2].title);
            Assert.AreEqual("Video", actual[3].title);
        }
    }
}