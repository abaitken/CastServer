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
        }
    }
}